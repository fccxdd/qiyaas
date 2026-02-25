// components/game_assets/settings/Settings.tsx

"use client";

import { IoMdSettings } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { GameConfig } from '@/lib/gameConfig';
import { useState } from "react";
import HardModeToggle from "@/components/game_assets/settings/HardModeToggle";

export default function Settings() {

  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
	setShowModal(true);
  };

  const handleCloseModal = () => {
	setShowModal(false);
  };

  return (
	<>
	  <button
		onClick={handleOpenModal}
		className="cursor-pointer rounded-full shadow-xl border border-solid border-transparent transition-all flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] hover:-translate-y-1 hover:shadow-2xl h-8 w-8 sm:h-9 sm:w-9"
		aria-label="Help"
	  >
		<IoMdSettings className="text-xl sm:text-2xl" />
	  </button>

	  {/* Modal */}
	  {showModal && (
		<div 
			className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-3 sm:p-4"
			onClick={(e) => {
				if (e.target === e.currentTarget) {
				handleCloseModal();
				}
			}}
			>
			<div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto relative">
				
				{/* Close button */}
				<button
				onClick={handleCloseModal}
				className="cursor-pointer absolute top-2 right-2 sm:top-4 sm:right-4 rounded-full p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
				aria-label="Close"
				>
				<IoMdClose className="text-xl sm:text-2xl text-black dark:text-white" />
				</button>
			
			{/* Modal content */}
			<div className="text-center">
			  <h2 className="text-xl sm:text-3xl font-bold text-black dark:text-white mb-3 sm:mb-6 pr-6">
				Settings
			  </h2>

			<div className="text-left space-y-3 sm:space-y-6">
				{/* Hard Mode */}
				<div>
				  <h3 className="text-base sm:text-xl font-semibold text-black dark:text-white mb-1 sm:mb-2 text-left">
					Hard Mode 
				  </h3>
				  <p>
					 Toggle for Hard Mode (Dashes will not appear yellow)
				  </p>
				</div>
			</div>
			</div>
		</div>
		</div>
	)}
	</>
  );
}