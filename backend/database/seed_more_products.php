<?php
/**
 * Database Seed: 20 New Amazon & Flipkart Flagship Products + Customer Reviews
 * Expands catalog from 16 to 36 products across Electronics, Fashion, Shoes, Appliances, Books, and Accessories.
 */

require_once __DIR__ . '/../config/database.php';

$db = Database::getConnection();

$newProducts = [
    [
        'category_id' => 1,
        'name' => 'Samsung Galaxy S24 Ultra 5G',
        'description' => 'The ultimate Galaxy Ultra smartphone forged in Titanium. Features revolutionary Galaxy AI with Live Call Translate and Circle to Search, Snapdragon 8 Gen 3 for Galaxy, and an integrated S Pen stylus with zero-latency handwriting.',
        'specifications' => 'Display: 6.8" Dynamic AMOLED 2X 120Hz (2600 nits Peak) | Processor: Snapdragon 8 Gen 3 for Galaxy | RAM: 12GB LPDDR5X | Storage: 256GB / 512GB / 1TB | Rear Cameras: 200MP Main + 50MP 5x Telephoto + 10MP 3x Telephoto + 12MP Ultra-Wide | Battery: 5000 mAh 45W Fast Charging | S Pen: Integrated Bluetooth Stylus | OS: One UI 6.1 with 7 Years OS Updates',
        'price' => 129999.00,
        'discount' => 10.00,
        'stock' => 25,
        'image' => '/uploads/products/galaxy-s24-ultra.svg'
    ],
    [
        'category_id' => 1,
        'name' => 'Apple iPhone 15 Pro',
        'description' => 'Forged in aerospace-grade titanium with contoured edges. Powered by the groundbreaking A17 Pro 3nm chip, customizable Action button, Dynamic Island, and pro 48MP camera system with 3x optical zoom and USB-C connectivity.',
        'specifications' => 'Display: 6.1" Super Retina XDR OLED ProMotion 120Hz Always-On | Processor: Apple A17 Pro (6-core CPU, 6-core GPU) | Camera: 48MP Main + 12MP Ultra-Wide + 12MP 3x Telephoto | Storage: 128GB / 256GB / 512GB / 1TB | Connector: USB-C (USB 3 up to 10Gb/s) | Material: Titanium Frame with Matte Textured Glass Back',
        'price' => 134900.00,
        'discount' => 8.00,
        'stock' => 20,
        'image' => '/uploads/products/iphone-15-pro.svg'
    ],
    [
        'category_id' => 1,
        'name' => 'OnePlus 12 5G (Flowy Emerald)',
        'description' => 'Smooth Beyond Belief. Features 4th Gen Hasselblad Camera system for mobile, Snapdragon 8 Gen 3 platform, 2K 120Hz ProXDR display with Aqua Touch, and blazing 100W SUPERVOOC charging.',
        'specifications' => 'Display: 6.82" 2K 120Hz ProXDR LTPO AMOLED (4500 nits) | Chipset: Snapdragon 8 Gen 3 | RAM: 16GB LPDDR5X | Storage: 512GB UFS 4.0 | Camera: 50MP Sony LYT-808 + 64MP 3x Periscope + 48MP Ultra-Wide Hasselblad | Charging: 100W Wired + 50W AIRVOOC Wireless | Battery: 5400 mAh Dual-Cell',
        'price' => 64999.00,
        'discount' => 12.00,
        'stock' => 30,
        'image' => '/uploads/products/oneplus-12.svg'
    ],
    [
        'category_id' => 1,
        'name' => 'Apple MacBook Air 15" M3',
        'description' => 'Strikingly thin and fast. Supercharged by Apple M3 chip with an expansive 15.3-inch Liquid Retina display, up to 18 hours battery life, 1080p FaceTime HD camera, and immersive 6-speaker sound system with Spatial Audio.',
        'specifications' => 'Processor: Apple M3 Chip (8-Core CPU, 10-Core GPU, 16-Core Neural Engine) | Unified Memory: 16GB | Storage: 512GB High-Speed SSD | Screen: 15.3" Liquid Retina 500 nits with True Tone | Audio: 6-Speaker sound system with force-cancelling woofers | Ports: MagSafe 3, 2x Thunderbolt / USB 4, 3.5mm Headphone Jack | Finish: Midnight',
        'price' => 134990.00,
        'discount' => 5.00,
        'stock' => 15,
        'image' => '/uploads/products/macbook-air-m3.svg'
    ],
    [
        'category_id' => 1,
        'name' => 'Sony Bravia 55" 4K Ultra HD Google TV',
        'description' => 'Experience vivid real-world colors and contrast powered by the 4K Processor X1. Featuring Dolby Vision and Dolby Atmos cinema sound, Google TV with hands-free voice assistant, and dedicated PlayStation gaming menu.',
        'specifications' => 'Screen Size: 55-inch 4K Ultra HD (3840 x 2160 Pixels) | Display Tech: Direct LED with TRILUMINOS PRO | Refresh Rate: 60Hz / Motionflow XR 200 | Audio: 20W X-Balanced Speaker with Dolby Atmos | Smart OS: Google TV with Chromecast Built-in | Ports: 4x HDMI (eARC/ALLM), 2x USB, Optical Out, Ethernet | Warranty: 1 Year Comprehensive Sony India',
        'price' => 57990.00,
        'discount' => 25.00,
        'stock' => 18,
        'image' => '/uploads/products/sony-bravia-tv.svg'
    ],
    [
        'category_id' => 1,
        'name' => 'Sony WH-1000XM5 Wireless ANC Headphones',
        'description' => 'Industry-leading noise cancellation engineered with two processors and eight microphones. Delivers Hi-Res Audio wireless streaming via LDAC, crystal-clear 4-mic beamforming calls, and ultra-comfortable soft fit leather.',
        'specifications' => 'Drivers: 30mm Carbon Fiber Composite Dome | Noise Cancelling: Auto NC Optimizer with Integrated Processor V1 | Audio Codecs: LDAC, AAC, SBC, DSEE Extreme | Battery: 30 Hours (ANC On) / 40 Hours (ANC Off) | Quick Charge: 3 mins for 3 hours playback | Multipoint: Connect 2 devices simultaneously | Weight: 250g',
        'price' => 29990.00,
        'discount' => 15.00,
        'stock' => 22,
        'image' => '/uploads/products/sony-wh1000xm5.svg'
    ],
    [
        'category_id' => 1,
        'name' => 'boAt Airdopes 141 ANC TWS Earbuds',
        'description' => 'Drown out unwanted ambient noise with up to 32dB Active Noise Cancellation. Boasts 42 hours total playtime, BEAST Mode with 50ms low latency for gaming, ENx Technology quad mics, and IPX5 splash resistance.',
        'specifications' => 'Driver Size: 10mm Dynamic Drivers | Active Noise Cancellation: Up to 32dB Hybrid ANC | Latency: 50ms Low Latency BEAST Mode | Battery: Up to 42 Hours Total Playtime (6h on single charge) | ASAP Charge: 10 mins = 150 mins playtime | Water Resistance: IPX5 Sweat and Water Resistant | Bluetooth: v5.3',
        'price' => 1299.00,
        'discount' => 60.00,
        'stock' => 75,
        'image' => '/uploads/products/boat-airdopes.svg'
    ],
    [
        'category_id' => 1,
        'name' => 'Apple iPad Air 11" M2 (Wi-Fi 128GB)',
        'description' => 'Supercharged by Apple M2 chip. Features a gorgeous 11-inch Liquid Retina display with anti-reflective coating, landscape 12MP Center Stage camera, ultra-fast Wi-Fi 6E, and compatibility with Apple Pencil Pro.',
        'specifications' => 'Chip: Apple M2 (8-core CPU, 9-core GPU, 16-core Neural Engine) | Screen: 11" Liquid Retina LED Backlit (2360x1640) with P3 Wide Color | Storage: 128GB | Cameras: 12MP Wide Back Camera + 12MP Landscape Ultra-Wide Front with Center Stage | Accessories: Supports Apple Pencil Pro & Magic Keyboard | OS: iPadOS 18',
        'price' => 59900.00,
        'discount' => 7.00,
        'stock' => 24,
        'image' => '/uploads/products/ipad-air-m2.svg'
    ],
    [
        'category_id' => 2,
        'name' => 'Levi\'s 511 Slim Fit Stretch Dark Jeans',
        'description' => 'A modern slim-fit with room to move. Designed with innovative Levi\'s Flex advanced stretch technology for maximum flex and all-day comfort. Cut close through the thigh with a slim leg opening.',
        'specifications' => 'Material: 99% Cotton, 1% Elastane | Fit: Slim from hip to ankle | Rise: Low / Sits below natural waist | Leg Opening: 14.5 inches | Closure: Heavy-duty metal zip fly with shank button | Pocket Styling: Classic 5-pocket with Arcuate back pocket stitching and Red Tab',
        'price' => 2199.00,
        'discount' => 35.00,
        'stock' => 45,
        'image' => '/uploads/products/levis-jeans.svg'
    ],
    [
        'category_id' => 2,
        'name' => 'U.S. Polo Assn. Solid Cotton Pique Polo',
        'description' => 'Authentic American sportswear staple. Crafted from 100% premium combed cotton pique knit for lightweight breathability. Features a ribbed collar, two-button placket, and signature embroidered double horseman logo.',
        'specifications' => 'Material: 100% Combed Cotton Pique | Pattern: Solid Navy Blue | Collar: Ribbed Polo Collar with contrast inner band | Fit: Regular / Standard Fit | Sleeves: Short Sleeves with ribbed armbands | Hem: Tennis tail hem with side vents | Care: Machine wash cold with like colors',
        'price' => 1149.00,
        'discount' => 40.00,
        'stock' => 55,
        'image' => '/uploads/products/polo-tshirt.svg'
    ],
    [
        'category_id' => 2,
        'name' => 'Zara Floral Print Linen Summer Maxi Dress',
        'description' => 'Breezy and effortlessly elegant maxi dress crafted from a lightweight linen-viscose blend. Decorated with an artisanal floral print, sweetheart neckline, delicate flutter straps, and subtle side slit.',
        'specifications' => 'Composition: 75% Pure Linen, 25% Viscose | Length: Floor-Length Maxi Silhouette | Neckline: Sweetheart Neck with soft gathering | Closure: Concealed side zip fastener | Lining: 100% Cotton lightweight voile | Origin: Designed in Spain | Care: Gentle hand wash or dry clean',
        'price' => 3590.00,
        'discount' => 20.00,
        'stock' => 28,
        'image' => '/uploads/products/zara-dress.svg'
    ],
    [
        'category_id' => 2,
        'name' => 'Puma Iconic T7 Training Tracksuit Jacket',
        'description' => 'A heritage streetwear legend re-engineered for athletes. Features classic 7cm T7 stripes down the sleeves, full-zip closure with stand-up rib collar, dryCELL moisture-wicking technology, and secure side pockets.',
        'specifications' => 'Fabric: 100% Recycled Polyester French Terry Tricot | Technology: dryCELL Moisture-Wicking | Design: Signature 7cm T7 sleeve panels | Pockets: 2 side welt zip hand pockets | Ribbing: Ribbed stand-up collar, cuffs, and hem | Logo: Rubberized Puma Archive No.1 logo print',
        'price' => 2499.00,
        'discount' => 45.00,
        'stock' => 35,
        'image' => '/uploads/products/puma-tracksuit.svg'
    ],
    [
        'category_id' => 3,
        'name' => 'Nike Air Jordan 1 Retro High OG Chicago',
        'description' => 'The grail of sneaker culture that started it all in 1985. Features premium full-grain leather in Varsity Red, Summit White, and Black color-blocking with encapsulated Nike Air heel cushioning and solid rubber pivot-traction sole.',
        'specifications' => 'Upper: Premium Full-Grain Calfskin Leather | Cushioning: Encapsulated Air-Sole unit in heel | Collar: High-cut padded ankle collar with Air Jordan Wings stamp | Outsole: Solid rubber cupsole with circular pivot ring pattern | Toe Box: Perforated for breathability | Edition: High OG Chicago Edition with extra laces',
        'price' => 16995.00,
        'discount' => 10.00,
        'stock' => 15,
        'image' => '/uploads/products/nike-air-jordan.svg'
    ],
    [
        'category_id' => 3,
        'name' => 'Puma Smashic Casual Retro White Sneakers',
        'description' => 'Clean tennis-inspired court sneakers built for daily style. Features soft synthetic leather upper, contrasting green suede Formstrip, and plush SoftFoam+ comfort insert for cloud-like step-in cushioning.',
        'specifications' => 'Upper: Soft Synthetic Leather with Suede Accents | Sockliner: SoftFoam+ Dual-Density Insole | Sole: Vulcanized Non-Marking Rubber | Closure: Classic 7-Eyelet Flat Cotton Lacing | Colorway: Puma White / Amazon Green / Team Gold | Weight: 340g (Size UK 8)',
        'price' => 1899.00,
        'discount' => 50.00,
        'stock' => 40,
        'image' => '/uploads/products/puma-sneakers.svg'
    ],
    [
        'category_id' => 3,
        'name' => 'Woodland Camel Nubuck Leather Trekking Boots',
        'description' => 'Uncompromising rugged outdoor durability. Handcrafted from heavy-duty oiled nubuck leather with water-repellent finish, rust-proof metal D-ring eyelets, and deep-grooved commando rubber tread for rock and mountain grip.',
        'specifications' => 'Upper: Heavy-Duty Oiled Nubuck Leather | Lining: Moisture-wicking breathable textile mesh | Outsole: Thermoplastic Deep-Lug Rubber Tread | Ankle: Padded Leather Collar and Gusseted Dust Tongue | Hardware: Anti-Rust Hexagonal Eyelets | Use: Himalayan Trekking, Biking, Rough Outdoor Terrain',
        'price' => 3995.00,
        'discount' => 25.00,
        'stock' => 20,
        'image' => '/uploads/products/woodland-boots.svg'
    ],
    [
        'category_id' => 4,
        'name' => 'Philips Digital Air Fryer HD9252 (4.1 L)',
        'description' => 'Crispy on the outside, tender on the inside with up to 90% less oil. Patented Rapid Air technology circulates vortex hot air for even cooking. Features 7 touch presets, Keep Warm function, and NutriU recipe app integration.',
        'specifications' => 'Capacity: 4.1 Liters (Up to 0.8 kg food capacity) | Power: 1400 Watts | Technology: Rapid Air Starfish Bottom Design | Control: Digital Touch LED Screen with Time & Temperature control | Presets: 7 Cooking Modes (Fries, Meat, Fish, Baking, Vegetables, Reheat, Keep Warm) | Dishwasher Safe: QuickClean non-stick basket',
        'price' => 6999.00,
        'discount' => 30.00,
        'stock' => 30,
        'image' => '/uploads/products/philips-airfryer.svg'
    ],
    [
        'category_id' => 4,
        'name' => 'Dyson V12 Detect Slim Cordless Vacuum Cleaner',
        'description' => 'Dyson\'s lightest intelligent cordless vacuum. A precisely angled green laser reveals invisible microscopic dust on hard floors. An acoustic piezo sensor automatically calculates dust particle sizes and increases suction power when needed.',
        'specifications' => 'Suction Power: 150 Air Watts with Hyperdymium Motor | Weight: 2.2 kg Ergonomic Ultra-Light | Run Time: Up to 60 Minutes Fade-Free Suction | Filtration: Whole-Machine HEPA Filtration traps 99.99% particles down to 0.3 microns | Screen: LCD Screen displays real-time particle counts and run-time | Bin Mechanism: Point-and-shoot hygienic bin emptying',
        'price' => 45900.00,
        'discount' => 15.00,
        'stock' => 12,
        'image' => '/uploads/products/dyson-vacuum.svg'
    ],
    [
        'category_id' => 5,
        'name' => 'Atomic Habits by James Clear',
        'description' => 'The #1 New York Times bestseller with over 15 million copies sold. Learn how small changes of just 1% every day compound into remarkable lifelong results. Includes the Four Laws of Behavior Change and practical habit-stacking strategies.',
        'specifications' => 'Author: James Clear | Publisher: Random House Business Books | Language: English | Format: Paperback | Pages: 320 Pages | ISBN-10: 1847941834 | ISBN-13: 978-1847941831 | Category: Self-Help, Personal Development, Productivity Masterclass',
        'price' => 499.00,
        'discount' => 35.00,
        'stock' => 80,
        'image' => '/uploads/products/atomic-habits.svg'
    ],
    [
        'category_id' => 5,
        'name' => 'The Psychology of Money by Morgan Housel',
        'description' => 'Timeless lessons on wealth, greed, and happiness. Doing well with money isn\'t necessarily about what you know—it\'s about how you behave. Through 19 engaging short stories, Morgan Housel explains the strange ways people think about financial freedom.',
        'specifications' => 'Author: Morgan Housel | Publisher: Jaico Publishing House | Format: Paperback | Pages: 256 Pages | Language: English | ISBN-10: 9390166268 | ISBN-13: 978-9390166268 | Bestseller: International Wall Street Journal & Sunday Times #1',
        'price' => 349.00,
        'discount' => 40.00,
        'stock' => 70,
        'image' => '/uploads/products/psychology-of-money.svg'
    ],
    [
        'category_id' => 6,
        'name' => 'Ray-Ban Classic Polarized Wayfarer RB2140',
        'description' => 'The most recognizable style in the history of sunglasses. Handcrafted in Italy from polished black acetate with signature tilted frame angle and crystal green G-15 polarized lenses that absorb 85% of visible light and block 100% of UV rays.',
        'specifications' => 'Frame Material: Handcrafted Gloss Black Acetate | Lens Type: Crystal Green G-15 Polarized Mineral Glass | UV Protection: 100% UVA/UVB Protection (UV400) | Lens-Bridge Dimensions: 50mm Lens Width - 22mm Bridge | Temple Length: 150mm | In The Box: Leather Protective Case, Microfiber Cleaning Cloth, Certificate of Authenticity',
        'price' => 8590.00,
        'discount' => 15.00,
        'stock' => 25,
        'image' => '/uploads/products/rayban-wayfarer.svg'
    ]
];

$checkStmt = $db->prepare("SELECT id FROM products WHERE name = ?");
$insertStmt = $db->prepare("
    INSERT INTO products (category_id, name, description, specifications, price, discount, stock, image, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW())
");

$inserted = 0;
$existing = 0;
$newIds = [];

foreach ($newProducts as $p) {
    $checkStmt->execute([$p['name']]);
    $existingId = $checkStmt->fetchColumn();

    if ($existingId) {
        $existing++;
        $newIds[$p['name']] = (int)$existingId;
    } else {
        $insertStmt->execute([
            $p['category_id'],
            $p['name'],
            $p['description'],
            $p['specifications'],
            $p['price'],
            $p['discount'],
            $p['stock'],
            $p['image']
        ]);
        $newId = (int)$db->lastInsertId();
        $newIds[$p['name']] = $newId;
        $inserted++;
    }
}

echo "Products Migration: {$inserted} new products inserted, {$existing} already existed.\n";

// Add sample customer reviews for the new flagship items if not present
$sampleReviews = [
    [
        'product' => 'Samsung Galaxy S24 Ultra 5G',
        'user_id' => 2,
        'rating' => 5,
        'review' => 'Galaxy AI Circle to Search and Live Call Translate work brilliantly! The Titanium build is premium and the flat AMOLED display is breathtaking under Delhi sunlight.'
    ],
    [
        'product' => 'Samsung Galaxy S24 Ultra 5G',
        'user_id' => 3,
        'rating' => 5,
        'review' => 'Battery lasts nearly two full days. 200MP camera details are mind blowing, and the built-in S Pen is super convenient for work notes.'
    ],
    [
        'product' => 'Apple iPhone 15 Pro',
        'user_id' => 2,
        'rating' => 5,
        'review' => 'Titanium makes this phone noticeably lighter than the 14 Pro! Action button is very handy and USB-C makes life so much easier with my MacBook charger.'
    ],
    [
        'product' => 'Nike Air Jordan 1 Retro High OG Chicago',
        'user_id' => 2,
        'rating' => 5,
        'review' => 'Authentic Chicago colorway! Leather quality is top notch and the sneakerhead vibes are unmatched. Arrived in mint double-boxed packaging.'
    ],
    [
        'product' => 'Philips Digital Air Fryer HD9252 (4.1 L)',
        'user_id' => 3,
        'rating' => 5,
        'review' => 'Made samosas and french fries with just 1 spoon of oil, came out super crispy! Extremely easy to clean the basket.'
    ],
    [
        'product' => 'Atomic Habits by James Clear',
        'user_id' => 2,
        'rating' => 5,
        'review' => 'Life-changing book on behavioral habits. Compounding small 1% daily habits makes achieving big goals realistic. Must read for everyone!'
    ]
];

$revCheck = $db->prepare("SELECT id FROM reviews WHERE user_id = ? AND product_id = ?");
$revInsert = $db->prepare("INSERT INTO reviews (user_id, product_id, rating, review, status, created_at) VALUES (?, ?, ?, ?, 1, NOW())");

$revCount = 0;
foreach ($sampleReviews as $sr) {
    if (isset($newIds[$sr['product']])) {
        $pId = $newIds[$sr['product']];
        $revCheck->execute([$sr['user_id'], $pId]);
        if (!$revCheck->fetchColumn()) {
            $revInsert->execute([$sr['user_id'], $pId, $sr['rating'], $sr['review']]);
            $revCount++;
        }
    }
}

echo "Reviews Seed: Added {$revCount} authentic customer reviews for new flagship products.\n";
