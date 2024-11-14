import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchPage from '../page'

describe('SearchPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders search page', () => {
    render(<SearchPage />)
    
    expect(screen.getByText('🎬 Pick a Movie! 🎬')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search for a Movie')).toBeInTheDocument()
    expect(screen.getByText('Get Recommendations')).toBeInTheDocument()
  })

  test('handles movie search', async () => {
    const mockMovies = ['Movie 1', 'Movie 2']
    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockMovies)
      } as Response)
    )

    render(<SearchPage />)
    
    const searchInput = screen.getByPlaceholderText('Search for a Movie')
    await userEvent.type(searchInput, 'mov')

    await waitFor(() => {
      expect(screen.getByText('Movie 1')).toBeInTheDocument()
      expect(screen.getByText('Movie 2')).toBeInTheDocument()
    })
  })

  test('allows selecting up to 5 movies', async () => {
    const mockMovies = ['Movie 1', 'Movie 2', 'Movie 3', 'Movie 4', 'Movie 5', 'Movie 6']
    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockMovies)
      } as Response)
    )

    render(<SearchPage />)
    
    // Simulate search to show movies
    const searchInput = screen.getByPlaceholderText('Search for a Movie')
    await userEvent.type(searchInput, 'mov')

    // Try to select all movies
    await waitFor(() => {
      mockMovies.forEach(async (movie) => {
        const movieElement = screen.getByText(movie)
        await userEvent.click(movieElement)
      })
    })

    expect(screen.getByText('You can only select up to 5 movies')).toBeInTheDocument()
  })

  test('handles movie recommendations', async () => {
    // Mock search response
    jest.spyOn(global, 'fetch')
      .mockImplementationOnce(() => // For search
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(['Movie 1'])
        } as Response)
      )
      .mockImplementationOnce(() => // For recommendations
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(['Rec 1', 'Rec 2'])
        } as Response)
      )

    render(<SearchPage />)
    
    // Search and select a movie
    const searchInput = screen.getByPlaceholderText('Search for a Movie')
    await userEvent.type(searchInput, 'mov')
    
    await waitFor(() => {
      const movieElement = screen.getByText('Movie 1')
      fireEvent.click(movieElement)
    })

    // Get recommendations
    const recommendButton = screen.getByText('Get Recommendations')
    await userEvent.click(recommendButton)

    await waitFor(() => {
      expect(screen.getByText('Rec 1')).toBeInTheDocument()
      expect(screen.getByText('Rec 2')).toBeInTheDocument()
    })
  })

  test('shows error when recommendations fail', async () => {
    // Mock search response
    jest.spyOn(global, 'fetch')
      .mockImplementationOnce(() => // For search
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(['Movie 1'])
        } as Response)
      )
      .mockImplementationOnce(() => // For recommendations
        Promise.reject(new Error('Failed to get recommendations'))
      )

    render(<SearchPage />)
    
    // Search and select a movie
    const searchInput = screen.getByPlaceholderText('Search for a Movie')
    await userEvent.type(searchInput, 'mov')
    
    await waitFor(() => {
      const movieElement = screen.getByText('Movie 1')
      fireEvent.click(movieElement)
    })

    // Try to get recommendations
    const recommendButton = screen.getByText('Get Recommendations')
    await userEvent.click(recommendButton)

    await waitFor(() => {
      expect(screen.getByText('Error getting predictions')).toBeInTheDocument()
    })
  })

  test('handles search errors', async () => {
    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.reject(new Error('Search failed'))
    )

    render(<SearchPage />)
    
    const searchInput = screen.getByPlaceholderText('Search for a Movie')
    await userEvent.type(searchInput, 'mov')

    await waitFor(() => {
      expect(screen.getByText('Error searching for movies. Please try again.')).toBeInTheDocument()
    })
  })

  test('loads recent movies on mount', async () => {
    const mockRecentMovies = [
      { name: 'Recent Movie 1' },
      { name: 'Recent Movie 2' }
    ]

    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockRecentMovies)
      } as Response)
    )

    render(<SearchPage />)

    await waitFor(() => {
      expect(screen.getByText('Recent Movie 1')).toBeInTheDocument()
      expect(screen.getByText('Recent Movie 2')).toBeInTheDocument()
    })
  })

  test('allows removing selected movies', async () => {
    // Mock search response
    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(['Movie 1'])
      } as Response)
    )

    render(<SearchPage />)
    
    // Search and select a movie
    const searchInput = screen.getByPlaceholderText('Search for a Movie')
    await userEvent.type(searchInput, 'mov')
    
    await waitFor(() => {
      const movieElement = screen.getByText('Movie 1')
      fireEvent.click(movieElement)
    })

    // Find and click remove button
    const removeButton = screen.getByText('Remove')
    await userEvent.click(removeButton)

    expect(screen.queryByText('Movie 1')).not.toBeInTheDocument()
  })

  test('shows warning when getting recommendations without selecting movies', async () => {
    render(<SearchPage />)
    
    const recommendButton = screen.getByText('Get Recommendations')
    await userEvent.click(recommendButton)

    expect(screen.getByText('Please select at least one movie')).toBeInTheDocument()
  })
})