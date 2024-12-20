// app/profile/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@nextui-org/react";
import { Alert, AlertDescription } from "../components/alert";
import axios from "axios";

// Interfance for the movie subject
interface Movie {
  name: string;
  score: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [friendUsername, setFriendUsername] = useState("")
  const [userMovies, setUserMovies] = useState<Movie[]>([]);
  const [friendsList, setFriendsList] = useState([]);
  const [recentFriendMovies, setRecentFriendMovies] = useState<Record<string, any[]>>({});
  const [alertState, setAlertState] = useState({
    show: false,
    message: '',
    type: 'default' as const
  });

  useEffect(() => {

  // Fetch user name
  axios.get("http://127.0.0.1:3001/getUserName", {
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }).then((response) => {
    setUserName(response.data);
  });

  // Fetch user's recent movies
  axios.get("http://127.0.0.1:3001/getRecentMovies", {
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }).then((response) => {
    setUserMovies(response.data);
  });

    // Fetch friends list and their recent movies
    axios.get("http://127.0.0.1:3001/getFriends", {
      headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }).then((response) => {
      setFriendsList(response.data);
    });
  }, []);

  const showFriendMovies = (friendName: string) => {
    if (recentFriendMovies[friendName]) {
        setRecentFriendMovies((prev) => ({ ...prev, [friendName]: [] }));
    } else {
        axios.get(`http://127.0.0.1:3001/getRecentFriendMovies?friend=${encodeURIComponent(friendName)}`)
            .then((response) => {
                setRecentFriendMovies((prev) => ({ ...prev, [friendName]: response.data }));
            })
            .catch((error) => {
                console.error("Failed to fetch friend's movies:", error);
            });
    }
};

  const addFriend = (username: string) => {
  // Prevent adding oneself as a friend
  if (username === userName) {
    setAlertState({
      show: true,
      message: "You cannot add yourself as a friend:(",
      type: 'default' 
    });
    return; // Stop further execution
  }
  // Ensure token is retrived correctly
  const token = localStorage.getItem('token');
  if (!token) {
    setAlertState({
      show: true,
      message: "Authentication token is missing.",
      type: 'default'
    });
    return; // Stop further execution if token is missing
  }
  axios.post("http://127.0.0.1:3001/friend", { user: username }, {
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  }).then(response => {
      setAlertState({
          show: true,
          message: 'Friend added successfully',
          type: 'default'  // Assuming you have a 'success' type for positive feedback
      });
  }).catch(error => {
      const message = error.response?.data?.error || 'Error adding friend.';
      setAlertState({
          show: true,
          message: message,
          type: 'default'  // Show error message returned from the server
      });
  });
  };

  
return (
  <main className="flex-grow flex flex-col items-center justify-center p-6 text-center">
    {/* User Name Banner */}
    <h1 className="text-4xl font-bold mb-8">
      Welcome {userName}!
    </h1>

    <div className="container max-w-3xl mx-auto space-y-8">
      {/* User's Reviewed Movies */}
      <section className="bg-gray-100 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-black">Your Reviewed Movies</h2>
        <ul className="space-y-2">
          {userMovies.map((movie, index) => (
            <li key={index} className="text-lg text-black">
              {movie.name}: {Array.from({ length: 10 }, (_, i) => i < movie.score ? '★' : '☆').join('')}
            </li>
          ))}
        </ul>
      </section>

      {/* Friends List with Recent Movies */}
      <section className="bg-gray-100 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-black">Your Friends</h2>
        <ul className="space-y-4">
          {friendsList.map((friend, index) => (
            <li key={index} className="relative">
              <Button
                onClick={() => showFriendMovies(friend)}
                color="success"
                className="w-full"
              >
                {friend}
              </Button>
              {recentFriendMovies[friend] && (
                <div className="absolute left-0 mt-2 w-full bg-white shadow-lg rounded-lg p-1 z-10">
                  {recentFriendMovies[friend].map((movie, idx) => (
                    <p key={idx} className="text-gray-700">
                      {movie.movie_name}: {Array.from({ length: 10 }, (_, i) => i < movie.score ? '★' : '☆').join('')}
                    </p>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Add Friend and Return Home Buttons */}
      <div className="flex flex-col items-center space-y-4">
        <Input
          value={friendUsername}
          onChange={(e) => setFriendUsername(e.target.value)} // Capture input value
          placeholder="Enter your friend's username"
          aria-label="FriendId"
          id="addFriend"
          className="w-full max-w-xs"
        />
        <Button
          onClick={() => addFriend(friendUsername)} // Pass friendUsername here
          color="primary"
          disabled={!friendUsername}  // Disable if input is empty
        >
          Add Friend
        </Button>
        {alertState.show && (
          <Alert
            variant={alertState.type}
            className="mx-auto max-w-2xl"
          >
            <AlertDescription>
              {alertState.message}
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={() => router.push("/")}
          color="primary"
        >
          Return Home
        </Button>
      </div>
    </div>
  </main>
);
}