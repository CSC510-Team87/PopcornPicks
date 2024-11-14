// ReviewPage.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReviewPage from '../page';    
import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';
import { useRouter } from 'next/router';
import React from 'react';
// Mock fetch and next/router
fetchMock.enableMocks();
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

beforeEach(() => {
  fetchMock.resetMocks();
});

describe('ReviewPage Component', () => {
  test('Test Case 1.1: Clears search results when input is empty', async () => {
    render(<ReviewPage />);
    const searchInput = screen.getByPlaceholderText('Search for a Movie');

    fireEvent.change(searchInput, { target: { value: ' ' } });
    expect(screen.queryByText(/Selected:/)).not.toBeInTheDocument();
  });

  test('Test Case 1.2: Displays search results from API response', async () => {
    fetchMock.mockResponseOnce(JSON.stringify(['Inception', 'Interstellar']));

    render(<ReviewPage />);
    const searchInput = screen.getByPlaceholderText('Search for a Movie');

    fireEvent.change(searchInput, { target: { value: 'Inception' } });
    await waitFor(() => screen.getByText('Inception'));
    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.getByText('Interstellar')).toBeInTheDocument();
  });

  test('Test Case 1.3: Shows error alert on search network failure', async () => {
    fetchMock.mockReject(() => Promise.reject('API is down'));

    render(<ReviewPage />);
    const searchInput = screen.getByPlaceholderText('Search for a Movie');

    fireEvent.change(searchInput, { target: { value: 'Matrix' } });
    await waitFor(() =>
      expect(screen.getByText('Error searching for movies. Please try again.')).toBeInTheDocument()
    );
  });

  test('Test Case 2.1: Selecting a movie sets selected movie state', async () => {
    render(<ReviewPage />);
    const searchInput = screen.getByPlaceholderText('Search for a Movie');

    fetchMock.mockResponseOnce(JSON.stringify(['Avatar']));
    fireEvent.change(searchInput, { target: { value: 'Avatar' } });
    await waitFor(() => screen.getByText('Avatar'));

    fireEvent.click(screen.getByText('Avatar'));
    expect(screen.getByText('Selected: Avatar')).toBeInTheDocument();
  });

  test('Test Case 3.1: Clicking on star sets rating state', () => {
    render(<ReviewPage />);
    const stars = screen.getAllByRole('button', { name: /star/i });

    fireEvent.click(stars[6]); // Click on the 7th star
    expect(stars[6]).toHaveClass('fill-warning'); // Check that 7th star is selected
  });

  test('Test Case 3.2: Shows error if no rating is provided on submit', async () => {
    render(<ReviewPage />);
    const submitButton = screen.getByText('Submit Review');

    fireEvent.click(submitButton);
    await waitFor(() =>
      expect(screen.getByText('Please rate the movie')).toBeInTheDocument()
    );
  });

  test('Test Case 4.1: Shows error if no movie selected on submit', async () => {
    render(<ReviewPage />);
    const submitButton = screen.getByText('Submit Review');

    fireEvent.click(submitButton);
    await waitFor(() =>
      expect(screen.getByText('Please select a movie')).toBeInTheDocument()
    );
  });

  test('Test Case 4.2: Successful review submission resets fields', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ message: 'Review submitted' }));

    render(<ReviewPage />);
    const searchInput = screen.getByPlaceholderText('Search for a Movie');
    const commentInput = screen.getByPlaceholderText('Share your thoughts about the movie...');
    const stars = screen.getAllByRole('button', { name: /star/i });
    const submitButton = screen.getByText('Submit Review');

    fetchMock.mockResponseOnce(JSON.stringify(['Avatar']));
    fireEvent.change(searchInput, { target: { value: 'Avatar' } });
    await waitFor(() => screen.getByText('Avatar'));
    fireEvent.click(screen.getByText('Avatar'));

    fireEvent.click(stars[7]); // Select 8 stars
    fireEvent.change(commentInput, { target: { value: 'Great movie!' } });
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(screen.getByText('Review submitted for Avatar. Rating: 8/10')).toBeInTheDocument()
    );
    expect(screen.queryByText('Selected: Avatar')).not.toBeInTheDocument();
  });

  test('Test Case 4.3: Shows error alert on review submission failure', async () => {
    fetchMock.mockReject(() => Promise.reject('API is down'));

    render(<ReviewPage />);
    const submitButton = screen.getByText('Submit Review');

    fireEvent.click(submitButton);
    await waitFor(() =>
      expect(screen.getByText('Error submitting review')).toBeInTheDocument()
    );
  });

  test('Test Case 5.1: Navigates to home on "Return to Home" click', () => {
    const push = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push });

    render(<ReviewPage />);
    fireEvent.click(screen.getByText('Return to Home'));
    expect(push).toHaveBeenCalledWith('/landing');
  });

  test('Test Case 5.2: Navigates to review wall on "View Review Wall" click', () => {
    const push = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push });

    render(<ReviewPage />);
    fireEvent.click(screen.getByText('View Review Wall'));
    expect(push).toHaveBeenCalledWith('/wall');
  });

  test('Test Case 6.1: Alerts display with appropriate styles for each type', async () => {
    render(<ReviewPage />);

    // Trigger an error alert
    const submitButton = screen.getByText('Submit Review');
    fireEvent.click(submitButton);
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveClass('alert-destructive')
    );

    // Reset alert state and trigger a default alert
    fireEvent.click(screen.getByText('Submit Review'));
    await waitFor(() =>
      expect(screen.getByRole('alert')).not.toHaveClass('alert-destructive')
    );
  });
});

