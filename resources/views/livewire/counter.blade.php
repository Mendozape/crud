<div class="container mt-4 text-center d-flex justify-content-center">
    <div class="card" style="width:18rem;">
        <div class="card-header">
            Livewire counter component
        </div>
        <div class="card-body">
            <button class="btn btn-success" wire:click="increment">+</button>
            <p class="card-text">
                {{ $count}}
            </p>
            <button class="btn btn-success" wire:click="decrement">-</button>
        </div>
    </div>
</div>