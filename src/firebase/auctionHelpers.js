// src/firebase/auctionHelpers.js
// Firestore helpers for the auction system

import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
  deleteDoc,
  addDoc,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./config"; // ← change "config" to match your firebase file name

// ─── Room Operations ──────────────────────────────────────────────────────────

export const createAuctionRoom = async (hostUid, hostName, settings) => {
  const roomRef = doc(collection(db, "auctionRooms"));
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const room = {
    id: roomRef.id,
    code,
    hostUid,
    hostName,
    status: "lobby",
    settings: {
      budget: settings.budget || 1000,
      maxTeams: settings.maxTeams || 8,
      bidIncrement: settings.bidIncrement || 5,
      bidTimer: settings.bidTimer || 30,
      maxSquadSize: settings.maxSquadSize || 15,
      minSquadSize: settings.minSquadSize || 11,
    },
    teams: {},
    currentPlayer: null,
    currentBid: null,
    soldPlayers: [],
    playerQueue: [],
    createdAt: serverTimestamp(),
  };
  await setDoc(roomRef, room);
  return room;
};

export const joinAuctionRoom = async (code, uid, displayName) => {
  const q = query(collection(db, "auctionRooms"), where("code", "==", code));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error("Room not found");
  const roomDoc = snap.docs[0];
  const room = roomDoc.data();
  if (room.status !== "lobby") throw new Error("Auction already started");
  const teams = room.teams || {};
  if (Object.keys(teams).length >= room.settings.maxTeams)
    throw new Error("Room is full");
  if (teams[uid]) return room;
  teams[uid] = {
    uid,
    name: displayName,
    budget: room.settings.budget,
    players: [],
    color: TEAM_COLORS[Object.keys(teams).length % TEAM_COLORS.length],
  };
  await updateDoc(roomDoc.ref, { teams });
  return { ...room, teams };
};

export const startAuction = async (roomId, playerQueue) => {
  await updateDoc(doc(db, "auctionRooms", roomId), {
    status: "bidding",
    playerQueue,
    currentPlayer: null,
    currentBid: null,
    startedAt: serverTimestamp(),
  });
};

export const nominatePlayer = async (roomId, player) => {
  await updateDoc(doc(db, "auctionRooms", roomId), {
    currentPlayer: player,
    currentBid: { amount: player.basePrice, uid: null, name: null },
    status: "bidding",
    bidStartedAt: serverTimestamp(),
  });
};

export const placeBid = async (roomId, uid, name, amount) => {
  await updateDoc(doc(db, "auctionRooms", roomId), {
    currentBid: { amount, uid, name, timestamp: Date.now() },
  });
};

export const sellPlayer = async (roomId, room) => {
  const { currentPlayer, currentBid, teams, soldPlayers, playerQueue } = room;
  if (!currentPlayer || !currentBid?.uid) return;
  const updatedTeams = { ...teams };
  updatedTeams[currentBid.uid] = {
    ...updatedTeams[currentBid.uid],
    budget: updatedTeams[currentBid.uid].budget - currentBid.amount,
    players: [
      ...(updatedTeams[currentBid.uid].players || []),
      { ...currentPlayer, soldFor: currentBid.amount },
    ],
  };
  const newQueue = playerQueue.filter((id) => id !== currentPlayer.id);
  await updateDoc(doc(db, "auctionRooms", roomId), {
    teams: updatedTeams,
    soldPlayers: [
      ...soldPlayers,
      { player: currentPlayer, soldTo: currentBid.uid, soldToName: currentBid.name, soldFor: currentBid.amount },
    ],
    currentPlayer: null,
    currentBid: null,
    playerQueue: newQueue,
    status: newQueue.length === 0 ? "ended" : "paused",
  });
};

export const unsoldPlayer = async (roomId, room) => {
  const { currentPlayer, playerQueue, soldPlayers } = room;
  const newQueue = playerQueue.filter((id) => id !== currentPlayer.id);
  await updateDoc(doc(db, "auctionRooms", roomId), {
    soldPlayers: [
      ...soldPlayers,
      { player: currentPlayer, soldTo: null, soldFor: 0 },
    ],
    currentPlayer: null,
    currentBid: null,
    playerQueue: newQueue,
    status: newQueue.length === 0 ? "ended" : "paused",
  });
};

export const endAuction = async (roomId) => {
  await updateDoc(doc(db, "auctionRooms", roomId), { status: "ended" });
};

export const deleteAuctionRoom = async (roomId) => {
  await deleteDoc(doc(db, "auctionRooms", roomId));
};

export const subscribeToRoom = (roomId, callback) => {
  return onSnapshot(doc(db, "auctionRooms", roomId), (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() });
  });
};

export const getRoomByCode = async (code) => {
  const q = query(collection(db, "auctionRooms"), where("code", "==", code));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
};

export const getUserRooms = async (uid) => {
  const all = await getDocs(collection(db, "auctionRooms"));
  return all.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((r) => r.hostUid === uid || (r.teams && r.teams[uid]));
};

// ─── Chat ─────────────────────────────────────────────────────────────────────
// Messages live in a subcollection: auctionRooms/{roomId}/chat/{msgId}
// Keeps the main room document small; chat scrolls independently.

export const sendChatMessage = async (roomId, uid, name, text, color) => {
  if (!text?.trim()) return;
  await addDoc(collection(db, "auctionRooms", roomId, "chat"), {
    uid,
    name,
    text: text.trim(),
    color: color || "#52A0E0",
    createdAt: serverTimestamp(),
  });
};

export const subscribeToChat = (roomId, callback) => {
  const q = query(
    collection(db, "auctionRooms", roomId, "chat"),
    orderBy("createdAt", "asc"),
    limit(100)
  );
  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(messages);
  });
};

// ─── Color palette for teams ──────────────────────────────────────────────────
export const TEAM_COLORS = [
  "#E05252", "#52A0E0", "#52E07A", "#E0C252",
  "#9B52E0", "#E07A52", "#52E0D4", "#E052A0",
];