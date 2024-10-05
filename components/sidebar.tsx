'use client'

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { menuItems } from "@/lib/menu-items";
import Image from "next/image";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";

const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const role = user?.publicMetadata.role as string;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Menu icon for small devices */}
      <button
        className="fixed top-14 left-4 z-50 mb-10 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {
          !isOpen && <Bars3Icon className="h-8 w-8 text-gray-500 font-bold" />
        }
        
      </button>

      {/* Modal sidebar for small devices */}
      <div 
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)}></div>
        <div 
          className={`fixed top-0 left-0 bottom-0 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 h-full overflow-y-auto custom-scrollbar">
            <button
              className="absolute top-4 right-4"
              onClick={() => setIsOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
            {menuItems.map((section) => (
              <div key={section.title} className="mb-6 mt-10">
                <h3 className="text-gray-400 font-light mb-2">{section.title}</h3>
                {section.items.map((item) => {
                  if (item.visible.includes(role)) {
                    return (
                      <Link
                        href={item.href}
                        key={item.label}
                        className="flex items-center gap-4 text-gray-500 py-2 hover:bg-lamaSkyLight"
                        onClick={() => setIsOpen(false)}
                      >
                        <Image src={item.icon} alt="" width={20} height={20} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  }
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Original sidebar for large devices and icon-only for small devices */}
      <div className="mt-10 text-sm h-[calc(100vh-var(--navbar-height,60px))] overflow-y-auto custom-scrollbar">
        {menuItems.map((section) => (
          <div className="flex flex-col gap-2" key={section.title}>
            <span className="hidden lg:block text-gray-400 font-light my-4">
              {section.title}
            </span>
            {section.items.map((item) => {
              if (item.visible.includes(role)) {
                return (
                  <Link
                    href={item.href}
                    key={item.label}
                    className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-lamaSkyLight"
                  >
                    <Image src={item.icon} alt="" width={20} height={20} />
                    <span className="hidden lg:block">{item.label}</span>
                  </Link>
                );
              }
            })}
          </div>
        ))}
      </div>
    </>
  );
};

export default Menu;