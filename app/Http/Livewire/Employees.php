<?php

namespace App\Http\Livewire;

use App\Models\Employee;
use Livewire\Component;
use Livewire\WithPagination;
use Livewire\WithFileUploads;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use App\Http\Controllers\FileController;
use Carbon\Carbon;
class Employees extends Component
{
    use WithPagination;

    protected $paginationTheme = 'bootstrap';
    public $selected_id, $keyWord, $name, $due, $comments, $image,$image2,$existe,$tempo;
    protected $listeners = ['destroy'];
    use WithFileUploads;
    public function render()
    {
        $keyWord = '%' . $this->keyWord . '%';
        $employees = Employee::latest()
            ->orWhere('name', 'LIKE', $keyWord)
            ->orWhere('due', 'LIKE', $keyWord)
            ->orWhere('comments', 'LIKE', $keyWord)
            ->orWhere('image', 'LIKE', $keyWord)
            ->paginate(10);
        return view('livewire.employees.view', compact('employees'));
    }

    public function cancel()
    {
        $this->resetInput();
    }

    private function resetInput()
    {
        $this->name = null;
        $this->due = null;
        $this->comments = null;
        $this->image = null;
    }

    public function store()
    {
        $this->validate([
            'name' => 'required',
            'due' => 'required|numeric|gte:1',
            'comments' => 'required',
            'image' => 'image|max:2048',
        ]);
        if (!empty($this->image)) {
            //$image_name = $this->image->getClientOriginalName();
            $imageName = carbon::now()->timestamp.'.'.$this->image->extension();
            //dd($image_name);
            $this->image->storeAs('public/images', $imageName);
        }
        Employee::create([
            'name' => $this->name,
            'due' => $this->due,
            'comments' => $this->comments,
            'image' => $imageName
        ]);
        $this->emit('saved', $this->name);
        $this->resetInput();
        //session()->flash('message', 'Employee Successfully created.');
    }
    
    public function edit($id)
    {


        $this->resetInput();
        $record = Employee::findOrFail($id);
        $this->selected_id = $id;
        $this->name = $record->name;
        $this->due = $record->due;
        $this->comments = $record->comments;
        
        if($record->image && Storage::disk('public')->exists($record->image)){
            $this->tempo = Storage::disk('public')->url($record->image);
        }else{
            $this->tempo = Storage::disk('public')->url('no_image.jpg');
        }
        //dd( Storage::disk('public')->exists($record->image));
        /*$this->image = $record->image;
        return redirect()->route('local.temp',$this->image);
        $disk = Storage::disk('local');
        return $disk->temporaryUrl($this->path, now()->addMinutes(5));*/

        //$this->tempo=$this->tempourl($record->image);
        //dd( $this->tempo);
        /*if($this->image) {
            $this->image = $record->image;
        }*/
        //$this->image = $record->image;
        //$ubica=Storage::disk('public')->temporaryUrl('pp12.jpeg', now()->addMinutes(5));
        //dd( $ubica);
        //$this->image2 = $record->image;
        //$this->existe=Storage::disk('public')->exists($this->image);
        //dd(  $this->image);
    }
    public function update()
    {
        $this->validate([
            'name' => 'required',
            'due' => 'required|numeric|gte:1',
            'comments' => 'required',
            'image' => 'required',
        ]);
        //dd( $this->image);
        if ($this->selected_id) {
            $record = Employee::find($this->selected_id);
            if (!empty($this->image)) {
                //image_name = $this->image->getClientOriginalName();
                $imageName = carbon::now()->timestamp.'.'.$this->image->extension();
                //dd($image_name);
                $this->image->storeAs('public/images', $imageName);
            }
            $record->update([
                'name' => $this->name,
                'due' => $this->due,
                'comments' => $this->comments,
                'image' => $this->image
            ]);
            $this->emit('edited', $this->name);
            $this->resetInput();
        }
    }
    public function predestroy($id)
    {
        $record = Employee::findOrFail($id);
       $this->dispatchBrowserEvent('swal:confirm', [
            'html' => $record->name,
            'id' => $id
        ]);
    }
    public function destroy($id)
    {
        $record = Employee::find($id);
        if ($id) {
            Employee::where('id', $id)->delete();
            $this->dispatchBrowserEvent('swal:deleted', ['title' => $record->name]);
        }
    }
}
