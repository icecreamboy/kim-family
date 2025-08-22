"use client";
import React, { useEffect, useState } from 'react';

type FamilyMember = {
  id: string;
  name: string;
  description: string;
};

const AboutPage = () => {
  const [familyData, setFamilyData] = useState<FamilyMember[]>([]);

  useEffect(() => {
    fetch('/data/family.json')
      .then(res => res.json())
      .then(setFamilyData);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">About the Kim Family</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {familyData.map((member) => (
          <div key={member.id} className="border rounded-lg p-4 shadow-md">
            <h2 className="text-xl font-semibold">{member.name}</h2>
            <p className="text-gray-700">{member.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutPage;