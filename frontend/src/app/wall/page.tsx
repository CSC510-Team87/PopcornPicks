"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardBody, 
  CardHeader,
  Button,
  Divider,
  Spinner
} from "@nextui-org/react";
import { Star } from "lucide-react";
import { Alert, AlertDescription } from '@/app/components/alert';

export default function WallPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertState, setAlertState] = useState({
    show: false,
    message: '',
    type: 'default'
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch('http://localhost:3001/reviews');
      const data = await response.json();
      setReviews(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setAlertState({
        show: true,
        message: 'Error loading reviews. Please try again later.',
        type: 'destructive'
      });
      setLoading(false);
    }
  };

  interface Review {
    name: string;
    username: string;
    time: string;
    score: number;
    review: string;
  }

  const ReviewCard = ({ review }: { review: Review }) => (
    
    <Card className="w-full mb-4">
      <CardHeader className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">{review.name}</h3>
          <p className="text-small text-default-500">
            Reviewed by {review.username} • {new Date(review.time).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-1">
          {[...Array(10)].map((_, index) => (
            <Star
              key={index}
              className={`w-4 h-4 ${
                index < review.score ? 'fill-warning text-warning' : 'text-default-400'
              }`}
            />
          ))}
        </div>
      </CardHeader>
      <Divider/>
      <CardBody>
        <p className="text-default-700">{review.review}</p>
      </CardBody>
    </Card>
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 p-4">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold">
          🍿 Review Wall
        </h2>
        <div className="space-y-2 text-lg text-muted-foreground">
          <p>
            See what others are saying about their favorite films!
          </p>
        </div>
      </div>

      {alertState.show && (
        <Alert 
          variant={alertState.type === 'destructive' ? 'destructive' : 'default'}
          className="mx-auto max-w-2xl"
        >
          <AlertDescription>
            {alertState.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Reviews Section */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-8">
            <Spinner size="lg" />
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review, index) => (
            <ReviewCard key={index} review={review} />
          ))
        ) : (
          <Card>
            <CardBody>
              <p className="text-center text-default-500">No reviews yet. Be the first to share your thoughts!</p>
            </CardBody>
          </Card>
        )}
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
          onClick={() => router.push("/review")}
          color="primary"
        >
          Write a Review
        </Button>
      </div>
    </div>
  );
}