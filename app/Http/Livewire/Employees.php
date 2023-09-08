<?php

namespace App\Http\Livewire;

use App\Models\Employee;
use Livewire\Component;
use Livewire\WithPagination;

class Employees extends Component
{
    use WithPagination;

    protected $paginationTheme = 'bootstrap';
    public $selected_id, $keyWord, $name, $due, $comments, $image;
    public $modal = false;
    protected $listeners = ['destroy'];
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
            'image' => 'required',
        ]);
        Employee::create([
            'name' => $this->name,
            'due' => $this->due,
            'comments' => $this->comments,
            'image' => $this->image
        ]);
        $this->emit('saved', $this->name);
        $this->resetInput();
        //session()->flash('message', 'Employee Successfully created.');
    }


    /*public function limpiar()
    {
        
		$this->name = '';
		$this->comments = '';
		$this->image = '';
    }

    public function editar($id)
    {
        $record = Employee::findOrFail($id);
        $this->selected_id = $id; 
		$this->name = $record-> name;
        $this->due = $record-> due;
		$this->comments = $record-> comments;
		$this->image = $record-> image;
        $this->abrirModal();
        $this->dispatchBrowserEvent('closeModal');
    }*/
    public function openModal()
    {
        $this->modal = true;
    }
    public function edit($id)
    {
        $record = Employee::findOrFail($id);
        $this->selected_id = $id;
        $this->name = $record->name;
        $this->due = $record->due;
        $this->comments = $record->comments;
        $this->image = $record->image;
    }
    public function update()
    {
        $this->validate([
            'name' => 'required',
            'due' => 'required|numeric|gte:1',
            'comments' => 'required',
            'image' => 'required',
        ]);

        if ($this->selected_id) {
            $record = Employee::find($this->selected_id);
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
        $this->dispatchBrowserEvent('swal:confirm', [
            'type' => 'warning',
            'title' => __('Are you sure?'),
            'html' => __('Are you <strong>agree</strong>?'),
            'confirmButtonText' => __('SURE???'),
            'id' => $id
        ]);
    }
    public function destroy($id)
    {
        if ($id) {
            Employee::where('id', $id)->delete();
            //$this->emit('test','adasd');
        }
    }
    
}
