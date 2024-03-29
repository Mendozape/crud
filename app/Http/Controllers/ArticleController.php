<?php
namespace App\Http\Controllers;
use App\Models\article;
use Illuminate\Http\Request;
use illuminate\Http\Client\Response;
class ArticleController extends Controller
{
    public function index()
    {
        return article::all();
    }

    public function show(Article $article)
    {
        return $article;
    }

    public function store(Request $request)
    {
        //$article = Article::create($request->all());
        $article = Article::create($request->all());
        return response()->json($article, 201);
    }

    public function update(Request $request, Article $article)
    {
        $article->update($request->all());
        return response()->json($article, 200);
    }
    public function delete(Article $article)
    {
        $article->delete();
        return response()->json(null, 204);
    }
}