import Character from "./Character";

function TextLine({
	text,
	lineIndex,
	charRefs,
}: {
	text: Character[];
	lineIndex: number;
	charRefs: React.MutableRefObject<{ [key: string]: HTMLSpanElement | null }>;
}) {
	return (
		<div className="flex flex-row">
			{text.map((char: Character, index: number) => {
				const charId = `char-${lineIndex}-${index}`;
				return (
					<span
						ref={(el) => (charRefs.current[charId] = el)}
						key={charId}
					>
						<Character char={char} charId={charId} />
					</span>
				);
			})}
		</div>
	);
}

export default TextLine;