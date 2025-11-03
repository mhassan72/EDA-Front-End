import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Grid, GridItem } from '../Grid';

describe('Grid', () => {
  it('renders with default props', () => {
    render(
      <Grid>
        <div>Grid item</div>
      </Grid>
    );
    
    const grid = screen.getByText('Grid item').parentElement;
    expect(grid).toHaveClass('grid', 'grid-cols-1', 'gap-4');
  });

  it('renders different column counts correctly', () => {
    const { rerender } = render(
      <Grid cols={2}>
        <div>Item 1</div>
        <div>Item 2</div>
      </Grid>
    );
    
    let grid = screen.getByText('Item 1').parentElement;
    expect(grid).toHaveClass('grid-cols-2');

    rerender(
      <Grid cols={3}>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </Grid>
    );
    
    grid = screen.getByText('Item 1').parentElement;
    expect(grid).toHaveClass('grid-cols-3');

    rerender(
      <Grid cols={12}>
        <div>Item 1</div>
      </Grid>
    );
    
    grid = screen.getByText('Item 1').parentElement;
    expect(grid).toHaveClass('grid-cols-12');
  });

  it('renders different gap sizes correctly', () => {
    const { rerender } = render(
      <Grid gap="none">
        <div>No gap</div>
      </Grid>
    );
    
    let grid = screen.getByText('No gap').parentElement;
    expect(grid).toHaveClass('gap-0');

    rerender(
      <Grid gap="sm">
        <div>Small gap</div>
      </Grid>
    );
    
    grid = screen.getByText('Small gap').parentElement;
    expect(grid).toHaveClass('gap-2');

    rerender(
      <Grid gap="xl">
        <div>Extra large gap</div>
      </Grid>
    );
    
    grid = screen.getByText('Extra large gap').parentElement;
    expect(grid).toHaveClass('gap-8');
  });

  it('applies responsive breakpoints correctly', () => {
    render(
      <Grid 
        cols={1} 
        responsive={{ 
          sm: 2, 
          md: 3, 
          lg: 4, 
          xl: 6 
        }}
      >
        <div>Responsive grid</div>
      </Grid>
    );
    
    const grid = screen.getByText('Responsive grid').parentElement;
    expect(grid).toHaveClass(
      'grid-cols-1',
      'sm:grid-cols-2',
      'md:grid-cols-3',
      'lg:grid-cols-4',
      'xl:grid-cols-6'
    );
  });

  it('applies custom className', () => {
    render(
      <Grid className="custom-grid">
        <div>Custom grid</div>
      </Grid>
    );
    
    const grid = screen.getByText('Custom grid').parentElement;
    expect(grid).toHaveClass('custom-grid');
  });
});

describe('GridItem', () => {
  it('renders with default props', () => {
    render(
      <GridItem>
        <div>Grid item content</div>
      </GridItem>
    );
    
    const gridItem = screen.getByText('Grid item content').parentElement;
    expect(gridItem).toHaveClass('col-span-1');
  });

  it('renders different span sizes correctly', () => {
    const { rerender } = render(
      <GridItem span={2}>
        <div>Span 2</div>
      </GridItem>
    );
    
    let gridItem = screen.getByText('Span 2').parentElement;
    expect(gridItem).toHaveClass('col-span-2');

    rerender(
      <GridItem span={6}>
        <div>Span 6</div>
      </GridItem>
    );
    
    gridItem = screen.getByText('Span 6').parentElement;
    expect(gridItem).toHaveClass('col-span-6');

    rerender(
      <GridItem span={12}>
        <div>Span 12</div>
      </GridItem>
    );
    
    gridItem = screen.getByText('Span 12').parentElement;
    expect(gridItem).toHaveClass('col-span-12');
  });

  it('applies responsive spans correctly', () => {
    render(
      <GridItem 
        span={1} 
        responsive={{ 
          sm: 2, 
          md: 4, 
          lg: 6, 
          xl: 12 
        }}
      >
        <div>Responsive item</div>
      </GridItem>
    );
    
    const gridItem = screen.getByText('Responsive item').parentElement;
    expect(gridItem).toHaveClass(
      'col-span-1',
      'sm:col-span-2',
      'md:col-span-4',
      'lg:col-span-6',
      'xl:col-span-12'
    );
  });

  it('applies custom className', () => {
    render(
      <GridItem className="custom-item">
        <div>Custom item</div>
      </GridItem>
    );
    
    const gridItem = screen.getByText('Custom item').parentElement;
    expect(gridItem).toHaveClass('custom-item');
  });
});