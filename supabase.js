// Supabase Configuration
const SUPABASE_URL = 'https://nmwhqwoznixwnsuulydx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2hxd296bml4d25zdXVseWR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NjEzNDEsImV4cCI6MjA4MzEzNzM0MX0.41nanEAwH8nnLVaWIyjLzd9lpJpws0gwibPuPAhYAQc';

// Initialize Supabase Client (renamed to avoid conflict with SDK global)
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Product Functions ---
async function fetchProducts() {
    const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }
    return data || [];
}

async function addProduct(product) {
    const { data, error } = await supabaseClient
        .from('products')
        .insert([product])
        .select();

    if (error) {
        console.error('Error adding product:', error);
        return null;
    }
    return data[0];
}

async function updateProduct(id, updates) {
    const cleanId = !isNaN(id) ? parseInt(id) : id;
    const { data, error } = await supabaseClient
        .from('products')
        .update(updates)
        .eq('id', cleanId)
        .select();

    if (error) {
        console.error('Error updating product:', error);
        return null;
    }
    return data[0];
}

async function deleteProduct(id) {
    const { error } = await supabaseClient
        .from('products')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting product:', error);
        return false;
    }
    return true;
}

// --- Category Functions ---
async function fetchCategories() {
    const { data, error } = await supabaseClient
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
    console.log('Fetched Categories:', data);
    return data || [];
}

async function addCategory(category) {
    const { data, error } = await supabaseClient
        .from('categories')
        .insert([category])
        .select();

    if (error) {
        console.error('Error adding category:', error);
        return null;
    }
    return data[0];
}

async function updateCategory(id, updates) {
    const cleanId = !isNaN(id) ? parseInt(id) : id;
    const { data, error } = await supabaseClient
        .from('categories')
        .update(updates)
        .eq('id', cleanId)
        .select();

    if (error) {
        console.error('Error updating category:', error);
        return null;
    }
    return data[0];
}

async function deleteCategory(id) {
    const cleanId = !isNaN(id) ? parseInt(id) : id;
    const { error } = await supabaseClient
        .from('categories')
        .delete()
        .eq('id', cleanId);

    if (error) {
        console.error('Error deleting category:', error);
        return false;
    }
    return true;
}

// --- Image Upload Function ---
async function uploadImage(file, bucket = 'categories') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabaseClient.storage
        .from(bucket)
        .upload(filePath, file);

    if (error) {
        if (error.message.includes('Bucket not found') || error.message.includes('bucket_not_found')) {
            const fallbacks = ['products', 'categories', 'images', 'public'];
            const currentIndex = fallbacks.indexOf(bucket);
            if (currentIndex !== -1 && currentIndex < fallbacks.length - 1) {
                const nextBucket = fallbacks[currentIndex + 1];
                console.log(`Bucket '${bucket}' not found, trying '${nextBucket}'...`);
                return uploadImage(file, nextBucket);
            }
        }
        console.error(`Error uploading to bucket ${bucket}:`, error);
        return null;
    }

    // Get public URL
    const { data: urlData } = supabaseClient.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return urlData.publicUrl;
}

// --- Brand Functions ---
async function fetchBrands(categoryId = null) {
    let query = supabaseClient
        .from('brands')
        .select('*')
        .order('name', { ascending: true });

    if (categoryId) {
        query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching brands:', error);
        return [];
    }
    return data || [];
}

async function addBrand(brand) {
    const { data, error } = await supabaseClient
        .from('brands')
        .insert([brand])
        .select();

    if (error) {
        console.error('Error adding brand:', error);
        return null;
    }
    return data[0];
}

// --- Multiple Image Upload ---
async function uploadMultipleImages(files, bucket = 'categories') {
    const urls = [];
    for (const file of files) {
        const url = await uploadImage(file, bucket);
        if (url) urls.push(url);
    }
    return urls;
}

// Make functions globally available
window.fetchProducts = fetchProducts;
window.addProduct = addProduct;
window.updateProduct = updateProduct;
window.deleteProduct = deleteProduct;
window.fetchCategories = fetchCategories;
window.addCategory = addCategory;
window.updateCategory = updateCategory;
window.deleteCategory = deleteCategory;
window.uploadImage = uploadImage;
window.uploadMultipleImages = uploadMultipleImages;
window.fetchBrands = fetchBrands;
window.addBrand = addBrand;

console.log('Supabase client initialized successfully!');

