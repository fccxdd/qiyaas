// components/TutorialSlideshow.tsx

"use client"

import TutorialContainer from '@/components/TutorialContainer';
import MinimalistKeyboard from '@/components/Keyboard';

export default function TutorialSlideshow() {

		return(
	 
		<div className="container mx-auto py-8">
			<TutorialContainer />
			{/* TODO: Move the keyboard into the container */}
			<MinimalistKeyboard/>
		</div>

)
}