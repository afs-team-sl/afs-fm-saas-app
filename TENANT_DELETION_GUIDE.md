# Tenant Deletion - Quick Reference Guide

## For Super Admin Users

### How to Delete an Organization

1. **Navigate to Super Admin Dashboard**
   - Login as Super Admin
   - Go to "Super Admin" page from sidebar

2. **Locate Organization**
   - Use search bar to find organization
   - View stats (users, assets, work orders)

3. **Click Delete Button**
   - Red "Delete" button in Actions column
   - Located before "Login as Admin" button

4. **First Confirmation**
   - Browser popup shows detailed warning
   - Lists all data that will be deleted:
     * All users
     * All assets
     * All work orders
     * All maintenance plans
     * All parts inventory
     * All facilities and spaces
   - Click OK to proceed or Cancel to abort

5. **Second Confirmation**
   - Prompt asks you to type organization name exactly
   - Example: Type "ACME Corp" (case-sensitive)
   - This prevents accidental deletions

6. **Deletion Process**
   - Loading toast appears: "Deleting..."
   - Backend performs cascade deletion
   - Success toast shows deletion counts
   - Table automatically refreshes

### What Gets Deleted

When you delete an organization, the following data is permanently removed:

**User Data:**
- All user accounts
- Login credentials
- User profiles
- Notification preferences

**Asset Data:**
- All assets
- Asset maintenance history
- Asset assignments
- Asset files/attachments

**Work Order Data:**
- All work orders (open and closed)
- Work order assignments
- Labor time tracking
- Completion notes

**Maintenance Data:**
- Preventive maintenance plans
- Maintenance schedules
- Recurring tasks

**Inventory Data:**
- All parts
- Stock quantities
- Part assignments

**Facility Data:**
- All buildings
- All floors
- All rooms/spaces
- Facility hierarchies

**Notification Data:**
- Organization-specific notifications
- User notification preferences

### What Does NOT Get Deleted

**System Data:**
- Global broadcast notifications (shared across all orgs)
- Super Admin account
- System configuration
- Other organizations' data

### Security Restrictions

**You CANNOT:**
- Delete your own organization (Super Admin)
- Delete without proper confirmation
- Recover data after deletion (permanent)

**You CAN:**
- Delete any non-Super-Admin organization
- View deletion statistics before confirming
- Cancel at any confirmation step

### API Endpoint

**DELETE** `/tenants/:id`

**Headers:**
```
Authorization: Bearer <super-admin-jwt-token>
x-tenant-id: <super-admin-tenant-id>
```

**Response:**
```json
{
  "message": "Tenant \"ACME Corp\" deleted successfully",
  "deletedCounts": {
    "users": 12,
    "assets": 45,
    "workOrders": 23
  }
}
```

### Error Messages

**"Access Denied: Only Super Admin can delete tenant organizations"**
- You are not logged in as Super Admin
- Check your tenant ID matches SUPER_TENANT_ID

**"Access Denied: Cannot delete the Super Admin organization"**
- You attempted to delete the Super Admin tenant
- This is prevented for security

**"Tenant with ID xxx not found"**
- Organization ID is invalid
- Organization may have been deleted already

**"Organization name did not match. Deletion cancelled."**
- You typed the wrong organization name
- Confirmation requires exact match (case-sensitive)

### Best Practices

1. **Backup Before Delete**
   - Export important data before deletion
   - Download reports and assets lists
   - Save work order history

2. **Verify Organization**
   - Double-check you're deleting the right org
   - Review user count and asset count
   - Confirm with organization admin

3. **Communicate First**
   - Notify organization admin
   - Give users time to export their data
   - Set a deletion date in advance

4. **Test First**
   - Practice on test/demo organizations
   - Understand the confirmation flow
   - Know what data gets deleted

5. **Document Deletion**
   - Note deletion date and reason
   - Save deletion statistics
   - Keep audit trail

### Recovery Options

**Before Deletion:**
- ✅ Export data using API
- ✅ Download Excel reports
- ✅ Create database backup
- ✅ Archive important documents

**After Deletion:**
- ❌ No recovery possible (hard delete)
- ❌ Data is permanently removed
- ❌ No "undo" functionality
- ❌ Database backup is only option

### Troubleshooting

**Delete button not appearing:**
- Verify you're logged in as Super Admin
- Check VITE_SUPER_TENANT_ID environment variable
- Refresh the page

**Deletion taking too long:**
- Large organizations with many assets may take time
- Wait for success toast
- Check browser console for errors
- Contact backend admin if timeout occurs

**Page not refreshing:**
- Click browser refresh button
- Check network tab for API errors
- Verify backend is running

### Support

For issues or questions:
1. Check browser console for errors
2. Review backend logs for detailed messages
3. Verify environment variables are set
4. Contact system administrator

---

**Warning:** Tenant deletion is irreversible. Always confirm you're deleting the correct organization and that all important data has been backed up.
