
import React, { useEffect, useRef, useState } from 'react';

/**
 * RevealOnScroll
 * 
 * Helper component that observes when its children enter the viewport
 * and toggles an 'is-visible' class to trigger CSS animations.
 */
const RevealOnScroll = ({ children, animation = 'fade-up', delay = 0, threshold = 0.1, className = '', style = {}, ...props }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: threshold
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) observer.unobserve(ref.current);
        };
    }, [threshold]);

    return (
        <div
            ref={ref}
            className={`reveal-wrapper ${animation} ${isVisible ? 'is-visible' : ''} ${className}`}
            style={{ transitionDelay: `${delay}s`, ...style }}
            {...props}
        >
            {children}
        </div>
    );
};

export default RevealOnScroll;
