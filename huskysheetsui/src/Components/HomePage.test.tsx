import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import { HomePage } from './HomePage';

describe('HomePage', () => {
    test('renders HomePage with initial sheets', () => {
        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );

        expect(screen.getByText('HomePage')).toBeInTheDocument();
        expect(screen.getByText('Sheet1')).toBeInTheDocument();
        expect(screen.getByText('Sheet2')).toBeInTheDocument();
        expect(screen.getByText('+')).toBeInTheDocument();
    });

    test('adds a new sheet when the add sheet button is clicked', () => {
        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('+'));

        expect(screen.getByText('Sheet3')).toBeInTheDocument();
    });

    test('navigation links are correct', () => {
        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );

        expect(screen.getByText('Sheet1').closest('a')).toHaveAttribute('href', '/spreadsheet');
        expect(screen.getByText('Sheet2').closest('a')).toHaveAttribute('href', '/spreadsheet');
    });
});
