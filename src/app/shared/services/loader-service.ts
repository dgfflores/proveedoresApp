import { Service, signal, computed } from '@angular/core';

@Service()
export class LoaderService {
    private activeRequests = signal(0);

    public isLoading = computed(() => this.activeRequests() > 0);

    show(): void {
        this.activeRequests.update(count => count + 1);
    }

    hide(): void {
        this.activeRequests.update(count => Math.max(0, count - 1));
    }
}