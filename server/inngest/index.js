import { Inngest } from "inngest";
import User from "../models/User.js";   // ✅ Correct import (case + .js)

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// Inngest Function to save user data to a database
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-creation" },   // ✅ Unique ID
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const userData = {
      _id: id,
      email: email_addresses[0]?.email_address || "",
      name: [first_name, last_name].filter(Boolean).join(" "),
      image: image_url,
    };

    await User.create(userData);
  }
);

// Inngest Function to delete user from database
const syncUserDeletion = inngest.createFunction(
  { id: "sync-user-deletion" },   // ✅ Unique ID
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    await User.findByIdAndDelete(id);
  }
);

// Inngest Function to update user data in database
const syncUserUpdation = inngest.createFunction(
  { id: "sync-user-updation" },   // ✅ Unique ID
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    const userData = {
      email: email_addresses[0]?.email_address || "",
      name: [first_name, last_name].filter(Boolean).join(" "),
      image: image_url,
    };

    await User.findByIdAndUpdate(id, userData, { new: true });
  }
);

export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];
