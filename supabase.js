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
async function uploadImage(file, bucket = 'images') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabaseClient.storage
        .from(bucket)
        .upload(filePath, file);

    if (error) {
        if (error.message.includes('Bucket not found')) {
            if (bucket !== 'categories' && bucket !== 'products') {
                console.log(`Bucket ${bucket} not found, trying 'categories'...`);
                return uploadImage(file, 'categories');
            } else if (bucket === 'categories') {
                console.log(`Bucket 'categories' not found, trying 'images'...`);
                return uploadImage(file, 'images');
            } else if (bucket === 'images') {
                console.log(`Bucket 'images' not found, trying 'public'...`);
                return uploadImage(file, 'public');
            }
        }
        console.error('Error uploading image:', error);
        return null;
    }

    // Get public URL
    const { data: urlData } = supabaseClient.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return urlData.publicUrl;
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

console.log('Supabase client initialized successfully!');
