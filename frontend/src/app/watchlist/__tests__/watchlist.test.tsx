import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WatchlistPage from '../page'

describe('WatchlistPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders watchlist page', () => {
    render(<WatchlistPage />)
    
    expect(screen.getByText('My Watchlist')).toBeInTheDocument()
    expect(screen.getByText('Add to Watchlist')).toBeInTheDocument()
  })

  test('loads existing watchlist on mount', async () => {
    const mockWatchlist = [
      { title: 'Movie 1', year: 2021 },
      { title: 'Movie 2', year: 2022 }
    ]

    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockWatchlist)
      } as Response)
    )

    render(<WatchlistPage />)

    await waitFor(() => {
      expect(screen.getByText('Movie 1')).toBeInTheDocument()
      expect(screen.getByText('Movie 2')).toBeInTheDocument()
    })
  })

  test('handles adding movie to watchlist', async () => {
    const mockMovies = ['New Movie 1', 'New Movie 2']
    jest.spyOn(global, 'fetch')
      .mockImplementationOnce(() => // For search
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockMovies)
        } as Response)
      )
      .mockImplementationOnce(() => // For adding to watchlist
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Movie added successfully' })
        } as Response)
      )

    render(<WatchlistPage />)
    
    const addButton = screen.getByText('Add to Watchlist')
    await userEvent.click(addButton)

    const searchInput = screen.getByPlaceholderText('Search movies')
    await userEvent.type(searchInput, 'new')

    await waitFor(() => {
      const movieElement = screen.getByText('New Movie 1')
      fireEvent.click(movieElement)
    })

    expect(screen.getByText('Movie added successfully')).toBeInTheDocument()
  })

  test('handles removing movie from watchlist', async () => {
    const mockWatchlist = [{ title: 'Movie to Remove', year: 2023 }]
    
    jest.spyOn(global, 'fetch')
      .mockImplementationOnce(() => // For initial load
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockWatchlist)
        } as Response)
      )
      .mockImplementationOnce(() => // For remove action
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Movie removed successfully' })
        } as Response)
      )

    render(<WatchlistPage />)

    await waitFor(() => {
      const removeButton = screen.getByText('Remove')
      fireEvent.click(removeButton)
    })

    expect(screen.getByText('Movie removed successfully')).toBeInTheDocument()
    expect(screen.queryByText('Movie to Remove')).not.toBeInTheDocument()
  })

  test('handles watchlist loading error', async () => {
    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.reject(new Error('Failed to load watchlist'))
    )

    render(<WatchlistPage />)

    await waitFor(() => {
      expect(screen.getByText('Error loading watchlist')).toBeInTheDocument()
    })
  })

  test('handles movie search error when adding to watchlist', async () => {
    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.reject(new Error('Search failed'))
    )

    render(<WatchlistPage />)
    
    const addButton = screen.getByText('Add to Watchlist')
    await userEvent.click(addButton)

    const searchInput = screen.getByPlaceholderText('Search movies')
    await userEvent.type(searchInput, 'error')

    await waitFor(() => {
      expect(screen.getByText('Error searching for movies')).toBeInTheDocument()
    })
  })

  test('handles marking movie as watched', async () => {
    const mockWatchlist = [{ title: 'Unwatched Movie', year: 2023, watched: false }]
    
    jest.spyOn(global, 'fetch')
      .mockImplementationOnce(() => // For initial load
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockWatchlist)
        } as Response)
      )
      .mockImplementationOnce(() => // For marking as watched
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Movie marked as watched' })
        } as Response)
      )

    render(<WatchlistPage />)

    await waitFor(() => {
      const watchedCheckbox = screen.getByRole('checkbox')
      fireEvent.click(watchedCheckbox)
    })

    expect(screen.getByText('Movie marked as watched')).toBeInTheDocument()
  })

  test('displays empty state message when watchlist is empty', async () => {
    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      } as Response)
    )

    render(<WatchlistPage />)

    await waitFor(() => {
      expect(screen.getByText('Your watchlist is empty')).toBeInTheDocument()
    })
  })

  test('handles sorting watchlist by different criteria', async () => {
    const mockWatchlist = [
      { title: 'B Movie', year: 2021 },
      { title: 'A Movie', year: 2022 }
    ]

    jest.spyOn(global, 'fetch').mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockWatchlist)
      } as Response)
    )

    render(<WatchlistPage />)

    const sortSelect = screen.getByRole('combobox')
    await userEvent.selectOptions(sortSelect, 'title')

    await waitFor(() => {
      const movies = screen.getAllByTestId('movie-item')
      expect(movies[0]).toHaveTextContent('A Movie')
      expect(movies[1]).toHaveTextContent('B Movie')
    })
  })
})
