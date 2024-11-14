"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardBody, 
  CardHeader,
  Input,
  Button,
  Textarea,
  Divider
} from "@nextui-org/react";
import { Alert, AlertDescription } from '@/app/components/alert';
import { Star } from "lucide-react";
import { useTheme } from "next-themes";

export default function ReviewPage() {
  const { theme } = useTheme();
  const router = useRouter();
  
  const [selectedMovie, setSelectedMovie] = useState('');
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [alertState, setAlertState] = useState({
    show: false,
    message: '',
    type: 'default' // can be 'default', 'destructive'
  });

  const handleSearch = async (query : any) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ q: query }),
      });
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching movies:', error);
      setAlertState({
        show: true,
        message: 'Error searching for movies. Please try again.',
        type: 'destructive'
      });
    }
  };

  const handleMovieSelect = (movie : any) => {
    setSelectedMovie(movie);
    setSearchResults([]);
  };

  const handleSubmitReview = async () => {
    if (!selectedMovie) {
      setAlertState({
        show: true,
        message: 'Please select a movie',
        type: 'destructive'
      });
      return;
    }
    if (rating === 0) {
      setAlertState({
        show: true,
        message: 'Please rate the movie',
        type: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movie: selectedMovie,
          score: rating,
          review: comments,
        }),
      });

      if (response.ok) {
        setAlertState({
          show: true,
          message: `Review submitted for ${selectedMovie}. Rating: ${rating}/10`,
          type: 'default'
        });
        // Reset form
        setSelectedMovie('');
        setRating(0);
        setComments('');
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (error) {
      setAlertState({
        show: true,
        message: 'Error submitting review',
        type: 'destructive'
      });
    }
  };

  return (
    <>
      {/* Main Content */}
      <div className="w-full max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold">
            🎬 Review a Movie! 🍿
          </h2>
          <div className="space-y-2 text-lg text-muted-foreground">
            <p>
              Share your thoughts about your favorite (or least favorite) movies.
            </p>
            <p>
              Rate films and help others discover great content!
            </p>
          </div>
        </div>

        {alertState.show && (
          <Alert 
            variant={alertState.type === 'destructive' ? 'destructive' : 'default'}
            className="mx-auto max-w-2xl"
            // onClose={() => setAlertState(prev => ({ ...prev, show: false }))}
          >
            <AlertDescription>
              {alertState.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Review Cards Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Search Section */}
          <Card>
            <CardHeader className="flex gap-3">
              <div className="flex flex-col">
                <p className="text-lg font-bold">Search for a movie</p>
              </div>
            </CardHeader>
            <Divider/>
            <CardBody>
              <Input 
                type="search"
                placeholder="Search for a Movie"
                onChange={(e) => handleSearch(e.target.value)}
                className="mb-4"
                size="lg"
                isClearable
              />
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((movie, index) => (
                    <Card
                      key={index}
                      isPressable
                      onPress={() => handleMovieSelect(movie)}
                      className="w-full"
                    >
                      <CardBody className="p-2">
                        {movie}
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
              {selectedMovie && (
                <Card className="mt-4 bg-default-100">
                  <CardBody className="p-2">
                    Selected: {selectedMovie}
                  </CardBody>
                </Card>
              )}
            </CardBody>
          </Card>

          {/* Rating Section */}
          <Card>
            <CardHeader className="flex gap-3">
              <div className="flex flex-col">
                <p className="text-lg font-bold">Rate and Review</p>
              </div>
            </CardHeader>
            <Divider/>
            <CardBody>
              <div className="mb-4">
                <p className="mb-2">Rate the movie:</p>
                <div className="flex gap-1">
                  {[...Array(10)].map((_, index) => (
                    <Button
                      key={index}
                      isIconOnly
                      variant="light"
                      className={index < rating ? 'text-warning' : 'text-default-400'}
                      onClick={() => setRating(index + 1)}
                    >
                      <Star 
                        className={`w-6 h-6 ${
                          index < rating ? 'fill-warning' : ''
                        }`}
                      />
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <p className="mb-2">Comments:</p>
                <Textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  minRows={4}
                  placeholder="Share your thoughts about the movie..."
                  size="lg"
                />
              </div>

              <Button 
                color="primary"
                className="w-full"
                size="lg"
                onClick={handleSubmitReview}
              >
                Submit Review
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button
            size="lg"
            onClick={() => router.push("/landing")}
            color="primary"
            variant="bordered"
          >
            Return to Home
          </Button>
          <Button
            size="lg"
            onClick={() => router.push("/wall")}
            color="primary"
          >
            View Review Wall
          </Button>
        </div>
      </div>
    </>
  );
}