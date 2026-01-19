import React from 'react';
import { Category } from '../types';
import { CATEGORIES } from '../constants';

interface HeaderProps {
  activeCategory: Category;
  setActiveCategory: (category: Category) => void;
}

const Header: React.FC<HeaderProps> = ({ activeCategory, setActiveCategory }) => {
  return (
    <header className="bg-white z-10 flex-shrink-0 px-4 py-3 border-b flex items-center justify-center">
      <div className="min-w-0 overflow-x-auto whitespace-nowrap hide-scrollbar">
        <nav className="inline-flex items-center">
          {CATEGORIES.map((category, index) => (
            <React.Fragment key={category.id}>
              <button
                onClick={() => setActiveCategory(category.id)}
                className={`text-base transition-colors duration-200 focus:outline-none whitespace-nowrap ${
                  activeCategory === category.id
                    ? 'text-black font-bold'
                    : 'text-gray-400 font-medium'
                }`}
              >
                {category.name}
              </button>
              {index < CATEGORIES.length - 1 && (
                <span className="text-gray-200 mx-2">|</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;