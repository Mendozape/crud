<!-- Edit Modal -->
<form wire:submit.prevent="update">
<div wire:ignore.self class="modal fade" id="updateDataModal" data-bs-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="updateModalLabel" >
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="updateModalLabel">Update Employee</h5>
                <button wire:click.prevent="cancel()" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form>
                    <input type="hidden" wire:model="selected_id">
                    <input type="hidden" wire:model="tempo">
                    <div class="form-group">

                        <label for="name">Name</label>
                        <input wire:model="name" type="text" class="form-control" id="name" placeholder="Name">@error('name') <span class="error text-danger">{{ $message }}</span> @enderror
                    </div>
                    <div class="form-group">
                        <label for="due">Due</label>
                        <input wire:model="due" type="text" class="form-control" id="due" placeholder="Due">@error('due') <span class="error text-danger">{{ $message }}</span> @enderror
                    </div>
                    <div class="form-group">
                        <div wire:loading wire:target="image" wire:key="image"> 
                            <i class="fa fa-spinner fa-spin mt-2 ml-2"></i><br>
                            Uploading<br>
                        </div>
                        @if ($image)
                            <br><img class="img img-circle" style="width:50px;" src="{{ $image->temporaryUrl() }}"><br>                                                      
                        @else
                        <br><img class="img img-circle" style="width:50px;" src="{{ $tempo }}">
                        @endif
                    </div>
                    <div class="custom-file">
                        <label for="ImageControl" />Select photo</label>
                        <input wire:model="image" type="file" class="form-control-file" id="image" placeholder="Image">
                        @error('image') <span class="error text-danger">{{ $message }}</span> @enderror 
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="submit" class="btn btn-primary">Save changes</button>
                <button type="button" wire:click.prevent="cancel()" class="btn btn-secondary" data-bs-dismiss="modal" id="close_edit">Close</button>
                <!--<button type="button" wire:click.prevent="update()" class="btn btn-primary">Save</button>-->
            </div>
        </div>
    </div>
</div>
</form>