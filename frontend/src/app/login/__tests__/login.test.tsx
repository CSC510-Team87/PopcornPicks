// src/app/login/__tests__/login.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "../../../test-utils";
import userEvent from "@testing-library/user-event";
import Login from "../page";
import { mockRouter } from "../../../../jest.setup";

// Setup fetch mock
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("Login Page", () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
    mockFetch.mockClear();
    localStorage.clear();
  });

  test("renders login form", () => {
    render(<Login />);

    expect(screen.getByText("Welcome Back")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your username")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your password")
    ).toBeInTheDocument();
  });

  test("shows validation errors for empty fields", async () => {
    render(<Login />);

    const signInButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(signInButton);

    expect(screen.getByText("Username is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  test("shows error for short password", async () => {
    render(<Login />);

    await userEvent.type(
      screen.getByPlaceholderText("Enter your password"),
      "12345"
    );
    const signInButton = screen.getByRole("button", { name: /sign in/i });
    await userEvent.click(signInButton);

    expect(
      screen.getByText("Password must be at least 6 characters")
    ).toBeInTheDocument();
  });

  test("handles successful login", async () => {
    const mockResponse = { token: "fake-token" };
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );

    render(<Login />);

    await userEvent.type(
      screen.getByPlaceholderText("Enter your username"),
      "testuser"
    );
    await userEvent.type(
      screen.getByPlaceholderText("Enter your password"),
      "password123"
    );
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith("token", "fake-token");
      expect(mockRouter.push).toHaveBeenCalledWith("/landing");
    });
  });

  test("handles login error", async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "Invalid credentials" }),
      })
    );

    render(<Login />);

    await userEvent.type(
      screen.getByPlaceholderText("Enter your username"),
      "testuser"
    );
    await userEvent.type(
      screen.getByPlaceholderText("Enter your password"),
      "password123"
    );
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  test("clears form after successful login", async () => {
    const mockResponse = { token: "fake-token" };
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      })
    );

    render(<Login />);

    const usernameInput = screen.getByPlaceholderText("Enter your username");
    const passwordInput = screen.getByPlaceholderText("Enter your password");

    await userEvent.type(usernameInput, "testuser");
    await userEvent.type(passwordInput, "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(usernameInput).toHaveValue("");
      expect(passwordInput).toHaveValue("");
    });
  });
});
