from django.db import models
from django.conf import settings


class Instrument(models.Model):
    """Medical instrument that can be added to surgical kits."""
    
    name = models.CharField(
        max_length=255,
        unique=True,
        help_text="Unique name of the instrument"
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text="Detailed description of the instrument's use"
    )
    image = models.ImageField(
        upload_to='instruments/',
        blank=True,
        null=True,
        help_text="Visual identification of the instrument"
    )

    class Meta:
        ordering = ['name']
        verbose_name = "Instrument"
        verbose_name_plural = "Instruments"

    def __str__(self):
        return self.name


class Kit(models.Model):
    """Surgical kit containing multiple instruments for specific operations."""
    
    name = models.CharField(
        max_length=255,
        help_text="Kit name (e.g., 'Appendectomy Kit')"
    )
    operation_type = models.CharField(
        max_length=255,
        help_text="Type of surgical operation this kit is designed for"
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text="Detailed description of the kit's purpose and contents"
    )
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='kits',
        help_text="Doctor who created this kit"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Date and time when the kit was created"
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Surgical Kit"
        verbose_name_plural = "Surgical Kits"

    def __str__(self):
        return self.name


class KitItem(models.Model):
    """Individual item/instrument within a surgical kit."""
    
    STATUS_CHOICES = (
        ('Active', 'Required'),
        ('Optional', 'Optional'),
        ('Substitute', 'Substitute'),
    )

    kit = models.ForeignKey(
        Kit,
        related_name='items',
        on_delete=models.CASCADE,
        help_text="Parent kit"
    )
    instrument = models.ForeignKey(
        Instrument,
        on_delete=models.CASCADE,
        help_text="Instrument in this kit"
    )
    quantity = models.PositiveIntegerField(
        default=1,
        help_text="Number of this instrument to include"
    )
    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default='Active',
        help_text="Whether this instrument is required, optional, or substitute"
    )

    class Meta:
        unique_together = ('kit', 'instrument')
        verbose_name = "Kit Item"
        verbose_name_plural = "Kit Items"

    def __str__(self):
        return f"{self.quantity}x {self.instrument.name}"