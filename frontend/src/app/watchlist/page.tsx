import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Button, Divider } from "@nextui-org/react";
import axios from "axios";

interface WatchlistMovie {
  id: string;
  title: string;
  addedDate: string;
}

export default function WatchlistPage() {
  const [movies, setMovies] = useState<WatchlistMovie[]>([]);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:3001/watchlist");
      setMovies(response.data);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
    }
  };

  const removeFromWatchlist = async (movieId: string) => {
    try {
      await axios.delete(`http://127.0.0.1:3001/watchlist/${movieId}`);
      fetchWatchlist();
    } catch (error) {
      console.error("Error removing from watchlist:", error);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold">My Watchlist 🎬</h2>
        <p className="text-lg text-muted-foreground">
          Keep track of movies you want to watch later
        </p>
      </div>

      <Card>
        <CardHeader className="flex gap-3">
          <div className="flex flex-col">
            <p className="text-lg font-bold">Your Movies</p>
          </div>
        </CardHeader>
        <Divider/>
        <CardBody>
          <div className="space-y-4">
            {movies.map((movie) => (
              <Card key={movie.id} className="w-full">
                <CardBody className="flex justify-between items-center p-4">
                  <div>
                    <p className="font-medium">{movie.title}</p>
                    <p className="text-sm text-default-500">
                      Added on {new Date(movie.addedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Button 
                    color="danger" 
                    variant="light"
                    onPress={() => removeFromWatchlist(movie.id)}
                  >
                    Remove
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}