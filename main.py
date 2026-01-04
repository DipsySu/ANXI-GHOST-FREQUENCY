import sys
import time
from rich.console import Console
from rich.panel import Panel
from rich.markdown import Markdown
from rich.prompt import Prompt
from rich.layout import Layout
from rich.live import Live
from rich.align import Align
from rich.spinner import Spinner

from core.client import AnxiClient
from core.imager import AnxiImager

console = Console()

def main():
    console.clear()
    console.print(Panel.fit("[bold cyan]Anxi Ghost Frequency[/bold cyan]\n[dim]Connecting to Timeline 640-808 AD...[/dim]", border_style="cyan"))

    # Initialize Core
    try:
        client = AnxiClient()
        imager = AnxiImager()
    except Exception as e:
        console.print(f"[red]Initialization Failed:[/red] {e}")
        return



    def render_log_panel(data):
        from rich.text import Text
        from rich.console import Group
        
        # 1. Header Line: [Year] :: Location
        header = Text()
        header.append(data.get("year_str", "[UNKNOWN YEAR]"), style="bold cyan")
        header.append(" :: ", style="dim white")
        header.append(data.get("location", "Unknown Sector"), style="bold white")
        
        # 2. Signal Line
        sig_val = data.get("signal", "LOST")
        sig_style = "bold red" if "微弱" in sig_val or "LOST" in sig_val else "bold green"
        signal = Text()
        signal.append("SIG: ", style="dim white")
        signal.append(sig_val, style=sig_style)

        # 3. Sender Line
        sender = Text()
        sender.append("FROM: ", style="dim yellow")
        sender.append(data.get("sender", "Anonymous"), style="bold yellow")

        # 4. Content
        content = Markdown(data.get("content", ""))

        # Assemble Group
        return Panel(
            Group(
                header,
                signal,
                Text("\n"), # Spacer
                sender,
                content
            ),
            border_style="cyan",
            title="[bold green]ANXI-NET SECURE LINK[/bold green]",
            subtitle=f"[dim]{data.get('last_post', 'END OF TRANSMISSION')}[/dim]"
        )

    while True:
        console.rule("[bold green]ROOT@ANXI-CORE[/bold green]")
        user_input = Prompt.ask("\n[bold green]Enter Year/Command[/bold green] (e.g. '790')")

        if user_input.lower() in ['exit', 'quit']:
            break

        if not user_input:
            user_input = "Random"

        # 1. Text Generation
        log_data = None
        with console.status("[bold cyan]Accessing Neural Archives...[/bold cyan]", spinner="dots"):
            log_data = client.generate_log(user_input)
        
        if not log_data:
             console.print("[red]Signal Lost[/red]")
             continue
             
        # 2. Display Log
        console.print("\n")
        console.print(render_log_panel(log_data))

        # 3. Image Generation
        image_prompt = log_data.get("image_prompt")
        if image_prompt:
            console.print(f"\n[dim]Visual reconstruction requested: {image_prompt[:50]}...[/dim]")
            with console.status("[bold yellow]Rendering Visual Data...[/bold yellow]", spinner="earth"):
                image_path = imager.generate_scene(image_prompt)
            
            if image_path:
                console.print(f"[bold green]Visual Saved:[/bold green] {image_path}")
            else:
                console.print("[red]Visual Reconstruction Failed[/red]")
        
        console.print("\n")

if __name__ == "__main__":
    main()
