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
    public $modal=false;
    protected $listeners = ['destroy'] ;
    public function render()
    {
		$keyWord = '%'.$this->keyWord .'%';
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
		'due' => 'required',
		'comments' => 'required',
		'image' => 'required',
        ]);

        Employee::create([ 
			'name' => $this-> name,
			'due' => $this-> due,
			'comments' => $this-> comments,
			'image' => $this-> image
        ]);
        
        $this->resetInput();
		$this->dispatchBrowserEvent('closeModal');
		session()->flash('message', 'Employee Successfully created.');
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
		$this->name = $record-> name;
        $this->due = $record-> due;
		$this->comments = $record-> comments;
		$this->image = $record-> image;
        //$this->openModal();
        //$this->emit('showx');
        //$this->dispatchBrowserEvent('showx');
    }
    public function update()
    {
        $this->validate([
		'name' => 'required',
		'due' => 'required',
		'comments' => 'required',
		'image' => 'required',
        ]);

        if ($this->selected_id) {
			$record = Employee::find($this->selected_id);
            $record->update([ 
			'name' => $this-> name,
			'due' => $this-> due,
			'comments' => $this-> comments,
			'image' => $this-> image
            ]);
            //$this->cerrarModal();
            //$this->emit('close2');
            $this->resetInput();
            //$this->emit('close2',$this->selected_id);
            //$this->dispatchBrowserEvent('close2', $this->selected_id);
            $this->dispatchBrowserEvent('closeModal');
			//session()->flash('message', 'Employee Successfully updated.');
        }
    }

    public function destroy($id)
    {
        //dd('Employees destroy');
        if ($id) {
            Employee::where('id', $id)->delete();
           /* $this->dispatchBrowserEvent('swal', [
                'title' => 'Employee deleted successfully',
                'timer'=>3000,
                'icon'=>'success',
                'toast'=>true
            ]);*/
        }/*else{
            $this->dispatchBrowserEvent('swal', [
                'title' => 'Something went wrong',
                'timer'=>3000,
                'icon'=>'success',
                'toast'=>true
            ]);

        }*/
       
    }
}