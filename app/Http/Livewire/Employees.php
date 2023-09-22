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
        $this->resetErrorBag();
    }
    private function getUrl($image)
    {
        if($image && Storage::disk('public')->exists($image)){
            $url= Storage::disk('public')->url($image);
        }else{
            $url = Storage::disk('public')->url('no_image.jpg');
        }
        return $url;
    }
    public function store()
    {
        $this->validate([
            'name' => 'required',
            'due' => 'required|numeric|gte:1',
            'comments' => 'required',
            'image' => 'image|max:4096',
        ]);
        if (!empty($this->image)) {
            $imageName= Carbon::now()->timestamp.'.'.$this->image->extension();
            //dd($image_name);
            $this->image->storeAs('/public/images', $imageName);
        }
        Employee::create([
            'name' => $this->name,
            'due' => $this->due,
            'comments' => $this->comments,
            'image' => $imageName
        ]);
        $this->resetInput();
        $this->emit('saved', $this->name);
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
        $this->tempo = $this->getUrl($record->image);
    }
    public function update()
    {
        if($this->image){
            $this->validate([
                'name' => 'required',
                'due' => 'required|numeric|gte:1',
                'comments' => 'required',
                'image' => 'image|max:4096'
            ]);
        }else{
            $this->validate([
                'name' => 'required',
                'due' => 'required|numeric|gte:1',
                'comments' => 'required',
            ]);
        }
        //dd( $this->image);
        if ($this->selected_id) {
            $record = Employee::find($this->selected_id);
            if ($this->image) {
                $imageName = carbon::now()->timestamp.'.'.$this->image->extension();
                $this->image->storeAs('public/images', $imageName);
            }
            if($this->image){
                $record->update([
                    'name' => $this->name,
                    'due' => $this->due,
                    'comments' => $this->comments,
                    'image' => $imageName
                ]);
            }else{
                $record->update([
                    'name' => $this->name,
                    'due' => $this->due,
                    'comments' => $this->comments
                ]);
            }
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
            if(Storage::disk('public')->exists($record->image)){
                Storage::disk('public')->delete($record->image);
            }
            $this->dispatchBrowserEvent('swal:deleted', ['title' => $record->name]);
        }
    }
    public function tellme()
    {
        $messages = [
            'A blessing in disguise',
            'Bite the bullet',
            'Call it a day',
            'Easy does it',
            'Make a long story short',
            'Miss the boat',
            'To get bent out of shape',
            'Birds of a feather flock together',
            "Don't cry over spilt milk",
            'Good things come',
            'Live and learn',
            'Once in a blue moon',
            'Spill the beans',
        ];
        $this->dispatchBrowserEvent(
            'notify', 
            $messages[array_rand($messages)]
        );
    }
}
