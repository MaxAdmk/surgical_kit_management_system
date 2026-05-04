from django.contrib import admin
from .models import Hospital

@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'country', 'email', 'created_at')
    search_fields = ('name', 'city', 'email')
    list_filter = ('country', 'created_at')
