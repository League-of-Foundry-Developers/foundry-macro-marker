import { Logger } from './logger';

export interface ActiveData {
    icon?: string,
    tooltip?: string
}

export class MacroConfig {
    constructor(protected logger: Logger, protected html: HTMLElement) { }

    public addFields(data: ActiveData): void {
        const command = <HTMLElement>this.html.querySelector('.form-group.command');
        if (!command) return;

        const container = document.createElement('div');
        container.classList.add('macro-marker');

        const tooltip = this.createTooltipField(data.tooltip);
        const icon = this.createIconField(data.icon);

        container.appendChild(tooltip);
        container.appendChild(icon);
        this.insertBefore(container, command);

        const fileBrowser = FilePicker.fromButton(<HTMLElement>icon.querySelector('input'), {});
        (<HTMLElement>icon.querySelector('input')).addEventListener('focus', () => {
            fileBrowser.render(true);
        });
    }

    public readFields(): ActiveData {
        const container = this.html.querySelector('.macro-marker');
        if (!container)
            return {};

        const tooltip = <HTMLInputElement>container.querySelector('input[name="macro-marker.tooltip"]');
        const icon = <HTMLInputElement>container.querySelector('input[name="macro-marker.icon"]');

        const result = {};
        if (tooltip?.value?.trim())
            result['tooltip'] = tooltip.value.trim();

        if (icon?.value?.trim())
            result['icon'] = icon.value.trim();

        return result;
    }

    private createTooltipField(tooltip?: string) {
        const newElement = document.createElement('div');
        newElement.innerHTML = `
        <div class="form-group">
            <label>Active tooltip:</label>
            <input type="text" name="macro-marker.tooltip" value="${tooltip || ''}" />
        </div>
        `;
        return newElement;
    }

    private createIconField(path?: string) {
        const newElement = document.createElement('div');
        newElement.innerHTML = `
        <div class="form-group">
            <label>Active icon:</label>
            <input type="text" name="macro-marker.icon" value="${path || ''}" data-target="macro-marker.icon" data-type="image" />
        </div>
        `;
        return newElement;
    }

    private insertBefore(newElement: HTMLElement, sibling: HTMLElement) {
        sibling.parentElement?.insertBefore(newElement, sibling);
    }
}