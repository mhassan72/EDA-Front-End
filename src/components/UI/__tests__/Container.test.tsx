import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Container } from '../Container';

describe('Container', () => {
  it('renders with default props', () => {
    render(<Container>Container content</Container>);
    const container = screen.getByText('Container content');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('mx-auto', 'w-full', 'max-w-4xl', 'px-4', 'sm:px-6', 'lg:px-8');
    expect(container.tagName).toBe('DIV');
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(<Container size="sm">Small</Container>);
    expect(screen.getByText('Small')).toHaveClass('max-w-sm');

    rerender(<Container size="md">Medium</Container>);
    expect(screen.getByText('Medium')).toHaveClass('max-w-md');

    rerender(<Container size="xl">Extra Large</Container>);
    expect(screen.getByText('Extra Large')).toHaveClass('max-w-6xl');

    rerender(<Container size="full">Full Width</Container>);
    expect(screen.getByText('Full Width')).toHaveClass('max-w-full');
  });

  it('renders different padding sizes correctly', () => {
    const { rerender } = render(<Container padding="none">No padding</Container>);
    expect(screen.getByText('No padding')).not.toHaveClass('px-4');

    rerender(<Container padding="sm">Small padding</Container>);
    expect(screen.getByText('Small padding')).toHaveClass('px-4', 'sm:px-6');

    rerender(<Container padding="lg">Large padding</Container>);
    expect(screen.getByText('Large padding')).toHaveClass('px-4', 'sm:px-6', 'lg:px-8', 'xl:px-12');
  });

  it('renders with different HTML elements', () => {
    const { rerender } = render(<Container as="section">Section content</Container>);
    const section = screen.getByText('Section content');
    expect(section.tagName).toBe('SECTION');

    rerender(<Container as="main">Main content</Container>);
    const main = screen.getByText('Main content');
    expect(main.tagName).toBe('MAIN');

    rerender(<Container as="article">Article content</Container>);
    const article = screen.getByText('Article content');
    expect(article.tagName).toBe('ARTICLE');
  });

  it('applies custom className', () => {
    render(<Container className="custom-container">Custom</Container>);
    expect(screen.getByText('Custom')).toHaveClass('custom-container');
  });

  it('combines all props correctly', () => {
    render(
      <Container 
        size="xl" 
        padding="lg" 
        className="custom-class" 
        as="section"
      >
        Combined props
      </Container>
    );
    
    const container = screen.getByText('Combined props');
    expect(container.tagName).toBe('SECTION');
    expect(container).toHaveClass(
      'mx-auto',
      'w-full',
      'max-w-6xl',
      'px-4',
      'sm:px-6',
      'lg:px-8',
      'xl:px-12',
      'custom-class'
    );
  });
});