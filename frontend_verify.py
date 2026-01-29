from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Navigate to the app
        print("Navigating to http://localhost:5173")
        page.goto("http://localhost:5173")

        # Wait for the map to load
        page.wait_for_selector(".leaflet-container")
        print("Map loaded")

        # Check for Sidebar
        if page.is_visible("text=Ambulance Drone System"):
            print("Sidebar visible")

        # Check for Markers (we expect images with class leaflet-marker-icon)
        # Note: We can't easily distinguish them without unique IDs or aria-labels in Leaflet by default easily,
        # but we can check count.
        # 1 Ambulance + 3 Hospitals = 4 Markers initially.
        page.wait_for_selector(".leaflet-marker-icon")
        markers = page.locator(".leaflet-marker-icon").count()
        print(f"Found {markers} markers")

        if markers >= 4:
            print("Markers verified")
        else:
            print("FAIL: Not enough markers found")

        # Click a hospital to trigger route (simulation)
        # We need to find a hospital marker. They are usually the ones that are NOT the ambulance.
        # Let's try to click the second one.
        marker_locators = page.locator(".leaflet-marker-icon")
        # Click the 2nd one (index 1)
        marker_locators.nth(1).click()
        print("Clicked a hospital marker")

        # Wait for popup
        page.wait_for_selector(".leaflet-popup-content")
        print("Popup visible")

        # Take screenshot
        page.screenshot(path="/home/jules/verification/frontend_verification.png")
        print("Screenshot saved to /home/jules/verification/frontend_verification.png")

        browser.close()

if __name__ == "__main__":
    run()
