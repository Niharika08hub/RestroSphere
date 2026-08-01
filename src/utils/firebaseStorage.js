import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

const itemsRef = collection(db, "items");

// Get all items
export const getItems = async () => {
  try {
    const snapshot = await getDocs(itemsRef);

    return snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));
  } catch (error) {
    console.error("Error fetching items:", error);
    return [];
  }
};



// Add item
export const addItem = async (item) => {
  try {
    const docRef = await addDoc(itemsRef, {
      ...item,
      claimed: false,
      status: "unclaimed",
      dateReported: new Date().toISOString(),
    });

    return docRef.id;
  } catch (error) {
    console.error(error);
  }
};

// Update item
export const updateItem = async (id, updates) => {
  try {
    console.log("Updating document:", id);
    console.log("Updates:", updates);

    const itemRef = doc(db, "items", id);

    await updateDoc(itemRef, updates);

    console.log("✅ Firestore update successful");
  } catch (error) {
    console.error("❌ Firestore Update Error:", error);
  }
};

export const deleteItem = async (id) => {
  try {
    console.log("Deleting ID:", id);

    const itemRef = doc(db, "items", id);

    await deleteDoc(itemRef);

    console.log("✅ Deleted Successfully");
  } catch (error) {
    console.error("❌ Delete Error:", error);
  }
};