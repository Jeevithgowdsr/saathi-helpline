// src/components/HelplineList.js
import React, { useEffect, useState } from "react";
import { db } from "../firebase"; // Adjust if firebase.js is in a different folder
import { collection, getDocs } from "firebase/firestore";

const HelplineList = () => {
  const [helplines, setHelplines] = useState([]);

  useEffect(() => {
    const fetchHelplines = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "helplines"));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setHelplines(data);
      } catch (error) {
        console.error("Error fetching helplines:", error);
      }
    };

    fetchHelplines();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Available Helplines</h2>
      <ul className="space-y-2">
        {helplines.map((helpline) => (
          <li key={helpline.id} className="p-3 border rounded shadow">
            <strong>{helpline.name}</strong><br />
            {helpline.description}<br />
            📞 <a href={`tel:${helpline.phone}`} className="text-blue-600">{helpline.phone}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HelplineList;
