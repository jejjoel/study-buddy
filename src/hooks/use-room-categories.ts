import { useMemo } from "react";
import { useRoomList } from "@/lib/services/room";

const DEFAULT_CATEGORIES = ["UI/UX Design", "Cyber Security", "Frontend Web"];

export function useRoomCategories() {
  const { rooms } = useRoomList();
  return useMemo(() => Array.from(new Set([...DEFAULT_CATEGORIES, ...rooms.map((room) => room.kategori)])).sort(), [rooms]);
}
