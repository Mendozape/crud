<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class ProfileController extends Controller
{
    /**
     * Update profile information (name, email, photo).
     * This version assumes 'profile_photo_path' is added to the User model's $appends.
     */
    public function updateProfileInformation(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name'  => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // --- PHOTO HANDLING ---
        if ($request->hasFile('photo')) {

            // 1. Delete existing photo if it exists
            if ($user->profile_photo_path) {
                // Since the disk 'public' points to 'storage/app/public', 
                // we just look into the 'images' subfolder.
                Storage::disk('public')->delete('images/' . $user->profile_photo_path);
            }

            // 2. Generate unique filename
            $photoFileName = Carbon::now()->timestamp . '.' . $request->photo->extension();

            // 3. Store new file
            // 'images' is the subfolder inside storage/app/public/
            // 'public' is the disk name defined in config/filesystems.php
            $request->photo->storeAs('images', $photoFileName, 'public');

            // 4. Update the user model with ONLY the filename
            $user->profile_photo_path = $photoFileName;
        }

        $user->name = $request->input('name');
        $user->email = $request->input('email');
        $user->save();

        // Get fresh instance with updated data
        $freshUser = $user->fresh();

        return response()->json([
            'message' => 'Perfil actualizado correctamente.',
            'user' => $freshUser,
        ], 200);
    }

    /**
     * Update user password.
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password' => 'required|string|min:3|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Verify current password
        if (!Hash::check($request->input('current_password'), $user->password)) {
            return response()->json([
                'errors' => ['current_password' => ['The current password is incorrect.']],
            ], 422);
        }

        // Save new password
        $user->password = Hash::make($request->input('password'));
        $user->save();

        return response()->json(['message' => 'Password updated successfully.'], 200);
    }
}
