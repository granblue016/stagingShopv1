import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '@/components/Header';
import * as cartStore from '@/stores/cart-store';
import * as authStore from '@/stores/auth-store';

// Mock the stores
vi.mock('@/stores/cart-store');
vi.mock('@/stores/auth-store');

// Mock the router
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
  useNavigate: () => vi.fn(),
}));

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the header with logo', () => {
    vi.mocked(cartStore.useCartStore).mockImplementation((selector: any) => selector({
      totalItems: () => 0,
    }));
    
    vi.mocked(authStore.useAuthStore).mockImplementation((selector: any) => selector({
      user: null,
      isAuthenticated: () => false,
      isAdmin: () => false,
      logout: vi.fn(),
    }));

    render(<Header />);
    expect(screen.getByText('ShopCart')).toBeInTheDocument();
  });

  it('should show cart badge when items in cart', () => {
    vi.mocked(cartStore.useCartStore).mockImplementation((selector: any) => selector({
      totalItems: () => 5,
    }));
    
    vi.mocked(authStore.useAuthStore).mockImplementation((selector: any) => selector({
      user: null,
      isAuthenticated: () => false,
      isAdmin: () => false,
      logout: vi.fn(),
    }));

    render(<Header />);
    expect(screen.getByTestId('cart-badge')).toHaveTextContent('5');
  });

  it('should show sign in button when not authenticated', () => {
    vi.mocked(cartStore.useCartStore).mockImplementation((selector: any) => selector({
      totalItems: () => 0,
    }));
    
    vi.mocked(authStore.useAuthStore).mockImplementation((selector: any) => selector({
      user: null,
      isAuthenticated: () => false,
      isAdmin: () => false,
      logout: vi.fn(),
    }));

    render(<Header />);
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });

  it('should show user avatar when authenticated', () => {
    vi.mocked(cartStore.useCartStore).mockImplementation((selector: any) => selector({
      totalItems: () => 0,
    }));
    
    vi.mocked(authStore.useAuthStore).mockImplementation((selector: any) => selector({
      user: { name: 'Test User', email: 'test@example.com' },
      isAuthenticated: () => true,
      isAdmin: () => false,
      logout: vi.fn(),
    }));

    render(<Header />);
    expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
  });

  it('should show admin links when user is admin', () => {
    vi.mocked(cartStore.useCartStore).mockImplementation((selector: any) => selector({
      totalItems: () => 0,
    }));
    
    vi.mocked(authStore.useAuthStore).mockImplementation((selector: any) => selector({
      user: { name: 'Admin User', email: 'admin@example.com' },
      isAuthenticated: () => true,
      isAdmin: () => true,
      logout: vi.fn(),
    }));

    render(<Header />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('AI Analytics')).toBeInTheDocument();
  });
});
