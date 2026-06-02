<?php

namespace App\Services;

use App\Repositories\CategoryRepository;
use Illuminate\Support\Facades\DB;
use Exception;

class CategoryService
{
    protected $categoryRepository;

    public function __construct(CategoryRepository $categoryRepository)
    {
        $this->categoryRepository = $categoryRepository;
    }

    public function getAllCategories()
    {
        return $this->categoryRepository->getAll();
    }

    public function getCategoryById($id)
    {
        return $this->categoryRepository->findById($id);
    }

    public function createCategory(array $data)
    {
        DB::beginTransaction();
        try {
            $category = $this->categoryRepository->create($data);
            DB::commit();
            return $category;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateCategory($id, array $data)
    {
        DB::beginTransaction();
        try {
            $category = $this->categoryRepository->update($id, $data);
            DB::commit();
            return $category;
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function deleteCategory($id)
    {
        return $this->categoryRepository->delete($id);
    }
}