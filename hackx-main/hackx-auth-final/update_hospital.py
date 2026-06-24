import os

filepath = 'c:/Users/dell/Desktop/ArogyaAI hackverse/AAROGYA-AI/hackx-main/hackx-auth-final/app/hospital/page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Change grid to flex column
old_grid = '<div style={{ display: "grid", gridTemplateColumns: activeTab === "analytics" ? "1fr" : "2fr 1fr", gap: 32 }}>'
new_grid = '<div style={{ display: "flex", flexDirection: "column", gap: 32 }}>'
content = content.replace(old_grid, new_grid)

# 2. Extract Analytics and place it before Main Column
main_col_idx = content.find('{/* Main Column */}')
analytics_idx = content.find('{/* Right Column / Analytics */}')

if main_col_idx != -1 and analytics_idx != -1:
    before_main = content[:main_col_idx]
    after_analytics = content[analytics_idx:]
    
    # find where analytics block ends (before '        </div>\n\n        {/* Informative Footer */}')
    footer_idx = after_analytics.find('{/* Informative Footer */}')
    # The end of the analytics block is just before the closing </div> of the main flex container
    # Let's find the closing </div> that comes right before the footer
    end_of_analytics_container = after_analytics.rfind('</div>', 0, footer_idx)
    
    # We actually want the whole analytics block which is wrapped by {(activeTab === "dashboard" || activeTab === "analytics") && (
    # Let's just grab the whole thing. It ends with '          )}\n\n        </div>\n\n        {/* Informative'
    analytics_end = after_analytics.find('          )}\n\n        </div>') + 12
    
    analytics_block = after_analytics[:analytics_end]
    main_block = content[main_col_idx:analytics_idx]
    
    # the rest is after analytics_end
    rest = after_analytics[analytics_end:]
    
    new_content = before_main + analytics_block + '\n\n' + main_block + rest
    content = new_content

# 3. Fix the layout of the Analytics block (change row/column logic to always be grid of 4)
old_analytics_div = '<div style={{ display: "flex", flexDirection: activeTab === "analytics" ? "row" : "column", gap: 32 }}>'
new_analytics_div = '<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>'
content = content.replace(old_analytics_div, new_analytics_div)

# 4. Fix empty space and heights inside analytics cards
old_card = 'background: C.card, borderRadius: 24, padding: 32, border: `1px solid ${C.border}`, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", flex: 1, display: "flex", flexDirection: "column"'
new_card = 'background: C.card, borderRadius: 24, padding: "24px 32px", border: `1px solid ${C.border}`, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", display: "flex", flexDirection: "column"'
content = content.replace(old_card, new_card)

old_card_2 = 'background: C.card, borderRadius: 24, padding: 32, border: `1px solid ${C.border}`, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)", flex: 1'
new_card_2 = 'background: C.card, borderRadius: 24, padding: "24px 32px", border: `1px solid ${C.border}`, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)"'
content = content.replace(old_card_2, new_card_2)

# Fix minHeight in patient influx chart
content = content.replace('minHeight: 180', 'minHeight: 120')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
