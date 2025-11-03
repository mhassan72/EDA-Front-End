import { useState, useEffect, useCallback } from 'react';

export interface UseSideMenuOptions {
  defaultOpen?: boolean;
  breakpoint?: number; // px width where menu should auto-open on desktop
}

export const useSideMenu = (options: UseSideMenuOptions = {}) => {
  const { defaultOpen = false, breakpoint = 1024 } = options;
  
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < breakpoint;
      const wasMobile = isMobile;
      setIsMobile(mobile);
      
      // Only auto-adjust after initial load and on actual resize
      if (hasInitialized && wasMobile !== mobile) {
        // Auto-open on desktop, auto-close on mobile
        if (!mobile && !isOpen) {
          setIsOpen(true);
        } else if (mobile && isOpen) {
          setIsOpen(false);
        }
      }
      
      if (!hasInitialized) {
        setHasInitialized(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint, isOpen, isMobile, hasInitialized]);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close menu when clicking outside on mobile
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const sideMenu = document.querySelector('[data-side-menu]');
      const menuButton = document.querySelector('[data-menu-button]');
      
      if (
        sideMenu && 
        !sideMenu.contains(target) && 
        menuButton && 
        !menuButton.contains(target)
      ) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isOpen, close]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        close();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, close]);

  return {
    isOpen,
    isMobile,
    toggle,
    open,
    close
  };
};