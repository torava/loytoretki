// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import type { ReactNode } from 'react';

import App from './App';

const { map } = vi.hoisted(() => ({
  map: { flyTo: vi.fn(), getZoom: vi.fn(() => 5) },
}));

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => (
    <div data-testid="map">{children}</div>
  ),
  Marker: ({
    children,
    position,
  }: {
    children: ReactNode;
    position: [number, number];
  }) => (
    <div data-testid="marker" data-position={JSON.stringify(position)}>
      {children}
    </div>
  ),
  Popup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TileLayer: () => null,
  useMap: () => map,
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  map.flyTo.mockReset();
  map.getZoom.mockClear();
});

describe('App smoke test', () => {
  it('renders the map', async () => {
    render(<App />);

    expect(screen.getByTestId('map')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tee löytöretki!' })).toBeInTheDocument();
  });
  it('switches between Finnish and English', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ display_name: 'Sample marker address' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<App />);

    expect(screen.getByTestId('map')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tee löytöretki!' })).toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox', { name: 'Kieli' }), {
      target: { value: 'en' },
    });

    expect(screen.getByRole('button', { name: 'Go explore!' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Language' })).toHaveValue('en');
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls[1][0]).toContain('accept-language=en');
    expect(document.documentElement.lang).toBe('en');
  });
  it('resolves the marker address, and moves to a random location', async () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.75)
      .mockReturnValueOnce(0.25);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ display_name: 'Sample marker address' }),
      }),
    );

    render(<App />);

    expect(screen.getByTestId('marker')).toHaveAttribute(
      'data-position',
      '[-90,-180]',
    );
    expect(
      await screen.findByText('Sample marker address'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Tee löytöretki!' }));

    await waitFor(() => {
      expect(screen.getByTestId('marker')).toHaveAttribute(
        'data-position',
        '[45,-90]',
      );
    });
    expect(map.flyTo).toHaveBeenCalledWith([45, -90], 5);
    expect(
      await screen.findByText('Sample marker address'),
    ).toBeInTheDocument();
  });
});
