import {
	useImperativeHandle,
	forwardRef,
	useState,
	useEffect,
	useCallback,
} from "react";

const Caret = forwardRef(
	(
		{
			charRefs,
		}: {
			charRefs: React.MutableRefObject<{
				[key: string]: HTMLSpanElement | null;
			}>;
		},
		ref
	) => {
		const [caretPosition, setCaretPosition] = useState({ top: 0, left: 0 });
		const [caretIndex, setCaretIndex] = useState({
			lineIndex: 0,
			charIndex: 0,
		});

		const updateCaretPosition = useCallback(
			(line: number, char: number) => {
				const charKey = `char-${line}-${char}`;
				const charElement = charRefs.current[charKey];
				if (charElement) {
					const { offsetTop, offsetLeft } = charElement;
					setCaretPosition({ top: offsetTop, left: offsetLeft });
				}
			},
			[charRefs]
		);

		// Exposes our local function to the parent via the ref
		useImperativeHandle(ref, () => ({
			setCaretIndex: (line: number, char: number) => {
				setCaretIndex({ lineIndex: line, charIndex: char });
			},
		}));

		useEffect(() => {
			// Update cursor position every render
			updateCaretPosition(caretIndex.lineIndex, caretIndex.charIndex);
		}, [caretIndex, updateCaretPosition]);

		return (
			<div
				className="blinking-cursor"
				style={{
					position: "absolute",
					top: `${caretPosition.top + 4}px`,
					left: `${caretPosition.left - 2}px`,
					height: "30px",
					backgroundColor: "black",
					width: "3px",
					borderRadius: "10px",
				}}
			></div>
		);
	}
);

export default Caret;
