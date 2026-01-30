import React, { useState, useEffect } from 'react';
import { FaList, FaArrowUp } from 'react-icons/fa';
import './TableOfContents.css';

/**
 * TableOfContents Component
 * Auto-generates TOC from h2 elements in the page
 * Allows scroll-to functionality
 */
const TableOfContents = ({ pageTitle = 'Document' }) => {
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState('');
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  useEffect(() => {
    // Find all h2 elements and create TOC
    const headings = document.querySelectorAll('.legal-section h2');
    const tocItems = Array.from(headings).map((heading, index) => {
      const id = heading.id || `section-${index}`;
      heading.id = id;
      return {
        id,
        text: heading.textContent,
        level: 2
      };
    });
    setSections(tocItems);

    // Track which section is in view and floating button visibility
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      // Show floating button after scrolling 300px
      setShowFloatingButton(window.scrollY > 300);
      
      for (let i = 0; i < headings.length; i++) {
        const heading = headings[i];
        if (heading.offsetTop <= scrollPosition) {
          setActiveSection(heading.id);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (sections.length === 0) return null;

  return (
    <div className="legal-toc-container">
      <div className="legal-toc-header">
        <FaList className="toc-icon" />
        <h3>Table of Contents</h3>
      </div>
      <ul className="legal-toc-list">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={`toc-link ${activeSection === section.id ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(section.id);
              }}
              role="doc-toc"
            >
              {section.text}
            </a>
          </li>
        ))}
      </ul>

      {/* Floating Back to Top Button */}
      {showFloatingButton && (
        <button
          className="floating-back-to-top"
          onClick={scrollToTop}
          aria-label="Back to top"
          title="Back to top"
        >
          <FaArrowUp />
        </button>
      )}
    </div>
  );
};

export default TableOfContents;
