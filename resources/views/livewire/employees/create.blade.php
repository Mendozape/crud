
<form wire:submit.prevent="store">
    <div wire:ignore.self class="modal fade" id="createDataModal" data-bs-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="createDataModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="createDataModalLabel">Create New Employee</h5>
                    <button wire:click.prevent="cancel()" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="form-group">
                            <label for="name"></label>
                            <input wire:model="name" type="text" class="form-control" id="name" placeholder="Name">@error('name') <span class="error text-danger">{{ $message }}</span> @enderror
                        </div>
                        <div class="form-group">
                            <label for="due"></label>
                            <input wire:model="due" type="text" class="form-control" id="due" placeholder="Due">@error('due') <span class="error text-danger">{{ $message }}</span> @enderror
                        </div>
                        <div class="form-group">
                            <label for="comments"></label>
                            <input wire:model="comments" type="text" class="form-control" id="comments" placeholder="Comments">@error('comments') <span class="error text-danger">{{ $message }}</span> @enderror
                        </div>
                        <div class="form-group">
                            @if ($image)
                                Photo Preview:<br>
                                <img class="img img-circle" style="width:50px;" src="{{ $image->temporaryUrl() }}"><br>                                                      
                            @endif 
                        </div>
                        <div class="form-group">
                            <label for="ImageControl" />Select photo</label>
                            <input wire:model="image" type="file" class="form-control-file" id="image" placeholder="Image">
                            @error('image') <span class="error text-danger">{{ $message }}</span> @enderror                                                      
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="submit">Save</button>
                    <!--<button type="button" wire:click.prevent="store()" class="btn btn-primary">Save</button>-->
                    <button type="button" class="btn btn-secondary close-btn" data-bs-dismiss="modal" id="close_add">Close</button>
                </div>
            </div>
        </div>
    </div>
</form>