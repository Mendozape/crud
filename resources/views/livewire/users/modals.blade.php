<!-- Add Modal -->
<div wire:ignore.self class="modal fade" id="createDataModal" data-bs-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="createDataModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="createDataModalLabel">Create New User</h5>
                <button wire:click.prevent="cancel()" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
           <div class="modal-body">
				<form>
                    <div class="form-group">
                        <label for="name"></label>
                        <input wire:model="name" type="text" class="form-control" id="name" placeholder="Name">@error('name') <span class="error text-danger">{{ $message }}</span> @enderror
                    </div>
                    <div class="form-group">
                        <label for="email"></label>
                        <input wire:model="email" type="text" class="form-control" id="email" placeholder="Email">@error('email') <span class="error text-danger">{{ $message }}</span> @enderror
                    </div>
                    <div class="form-group">
                        <label for="two_factor_secret"></label>
                        <input wire:model="two_factor_secret" type="text" class="form-control" id="two_factor_secret" placeholder="Two Factor Secret">@error('two_factor_secret') <span class="error text-danger">{{ $message }}</span> @enderror
                    </div>
                    <div class="form-group">
                        <label for="two_factor_recovery_codes"></label>
                        <input wire:model="two_factor_recovery_codes" type="text" class="form-control" id="two_factor_recovery_codes" placeholder="Two Factor Recovery Codes">@error('two_factor_recovery_codes') <span class="error text-danger">{{ $message }}</span> @enderror
                    </div>
                    <div class="form-group">
                        <label for="two_factor_confirmed_at"></label>
                        <input wire:model="two_factor_confirmed_at" type="text" class="form-control" id="two_factor_confirmed_at" placeholder="Two Factor Confirmed At">@error('two_factor_confirmed_at') <span class="error text-danger">{{ $message }}</span> @enderror
                    </div>
                    <div class="form-group">
                        <label for="current_team_id"></label>
                        <input wire:model="current_team_id" type="text" class="form-control" id="current_team_id" placeholder="Current Team Id">@error('current_team_id') <span class="error text-danger">{{ $message }}</span> @enderror
                    </div>
                    <div class="form-group">
                        <label for="profile_photo_path"></label>
                        <input wire:model="profile_photo_path" type="text" class="form-control" id="profile_photo_path" placeholder="Profile Photo Path">@error('profile_photo_path') <span class="error text-danger">{{ $message }}</span> @enderror
                    </div>

                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary close-btn" data-bs-dismiss="modal">Close</button>
                <button type="button" wire:click.prevent="store()" class="btn btn-primary">Save</button>
            </div>
        </div>
    </div>
</div>

<!-- Edit Modal -->
<div wire:ignore.self class="modal fade" id="updateDataModal" data-bs-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="updateModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
       <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="updateModalLabel">Update User</h5>
                <button wire:click.prevent="cancel()" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form>
					<input type="hidden" wire:model="selected_id">
                    <div class="form-group">
                        <label for="name"></label>
                        <input wire:model="name" type="text" class="form-control" id="name" placeholder="Name">@error('name') <span class="error text-danger">{{ $message }}</span> @enderror
                    </div>
                    <div class="form-group">
                        <label for="email"></label>
                        <input wire:model="email" type="text" class="form-control" id="email" placeholder="Email">@error('email') <span class="error text-danger">{{ $message }}</span> @enderror
                    </div>
                    <div class="form-group">
                        <label for="two_factor_secret"></label>
                        <input wire:model="two_factor_secret" type="text" class="form-control" id="two_factor_secret" placeholder="Two Factor Secret">@error('two_factor_secret') <span class="error text-danger">{{ $message }}</span> @enderror
                    </div>
                    <div class="form-group">
                        <label for="two_factor_recovery_codes"></label>
                        <input wire:model="two_factor_recovery_codes" type="text" class="form-control" id="two_factor_recovery_codes" placeholder="Two Factor Recovery Codes">@error('two_factor_recovery_codes') <span class="error text-danger">{{ $message }}</span> @enderror
                    </div>
                    <div class="form-group">
                        <label for="two_factor_confirmed_at"></label>
                        <input wire:model="two_factor_confirmed_at" type="text" class="form-control" id="two_factor_confirmed_at" placeholder="Two Factor Confirmed At">@error('two_factor_confirmed_at') <span class="error text-danger">{{ $message }}</span> @enderror
                    </div>
                    <div class="form-group">
                        <label for="current_team_id"></label>
                        <input wire:model="current_team_id" type="text" class="form-control" id="current_team_id" placeholder="Current Team Id">@error('current_team_id') <span class="error text-danger">{{ $message }}</span> @enderror
                    </div>
                    <div class="form-group">
                        <label for="profile_photo_path"></label>
                        <input wire:model="profile_photo_path" type="text" class="form-control" id="profile_photo_path" placeholder="Profile Photo Path">@error('profile_photo_path') <span class="error text-danger">{{ $message }}</span> @enderror
                    </div>

                </form>
            </div>
            <div class="modal-footer">
                <button type="button" wire:click.prevent="cancel()" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" wire:click.prevent="update()" class="btn btn-primary">Save</button>
            </div>
       </div>
    </div>
</div>
