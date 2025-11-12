# Code Typer ⌨️

A typing game **built for programmers.** Practice typing *real code*, not lorem ipsum.
<br>


<div align="center">
  <img src="https://github.com/user-attachments/assets/d9d6e967-bcf4-482e-9674-4c9015b49132" width="90%"/>
</div>


## Features 🎉
Code Typer is a type racing game that lets you practice with **10k+ real snippets** across **9+ programming languages**.  
Every snippet comes from real open-source repositories, so you type *actual production code* with brackets, quotes and all the tiny details that make code challenging to type fast.
- **Real snippets** — All the code snippets are real and actively pulled from open-source repos across GitHub.
- **Auto-closing** — Auto-closing brackets adn quotes simulate a real code editor experience.
- **IDE-like shortcuts** — `Cmd/Ctrl + Backspace` deletes the line, `Alt + Backspace` goes to the previous word.

### Auto-closing Modes

Currently you can toggle between three different modes for the auto-closing.
| Mode | What happens |
| ------------ | ----------------------------------------------------- |
| **Full** | All brackets, parenthesis, quotation marks are automatically closed when you type them and skipped when you reach them. |
| **Partial** | All brackets, parenthesis, quotation marks that are automatically closed when you type them, but you actually need to type the closing character (or press the right arrow!) to move past it.
| **Disabled** | Nothing auto-completes, every bracket is on you. |

## Tech Stack 🛠️

- Next.js 16
- Tailwind
- Zustand
- Prisma + PostgreSQL
- Tree-sitter grammars (JS/TS/C/C++/C#/Java/Python/Lua)
- highlight.js
- Recharts

## License 📄

This project is licensed under the MIT License. See the [LICENSE](https://github.com/mattiacerutti/code-typer/blob/main/LICENSE) file for details.

## Contributors ⭐

<a href="https://github.com/mattiacerutti/code-typer/graphs/contributors" align="center">
  <img src="https://contrib.rocks/image?repo=mattiacerutti/code-typer" /> 
</a>
