
// PATCH /api/inventario/:id - Ajustar stock de un inventario específico
router.patch('/:id', async (req, res) => {
  try {
    const { tipoMovimiento, cantidad, motivo, usuarioId } = req.body;
    
    if (!tipoMovimiento || !cantidad) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de movimiento y cantidad son requeridos'
      });
    }

    const inventario = await Inventario.findById(req.params.id).populate('producto');
    
    if (!inventario) {
      return res.status(404).json({
        success: false,
        message: 'Inventario no encontrado'
      });
    }

    // Ejecutar el método según el tipo de movimiento
    if (tipoMovimiento === 'entrada') {
      await inventario.agregarStock(
        cantidad, 
        {}, // loteData vacío
        usuarioId, 
        motivo || 'Entrada de stock'
      );
    } else if (tipoMovimiento === 'salida') {
      await inventario.reducirStock(
        cantidad, 
        usuarioId, 
        motivo || 'Salida de stock'
      );
    } else if (tipoMovimiento === 'ajuste') {
      await inventario.ajustarStock(
        cantidad, // En ajuste, cantidad es el nuevo stock total
        usuarioId, 
        motivo || 'Ajuste de stock'
      );
    } else {
      return res.status(400).json({
        success: false,
        message: 'Tipo de movimiento inválido. Debe ser: entrada, salida o ajuste'
      });
    }

    // Recargar con populate
    await inventario.populate({
      path: 'producto',
      populate: [
        { path: 'categoria', select: 'nombre slug' },
        { path: 'variante', select: 'nombre slug imagen' },
        { path: 'formato', select: 'nombre capacidad unidad' }
      ]
    });

    res.json({
      success: true,
      message: `Stock ${tipoMovimiento === 'entrada' ? 'incrementado' : tipoMovimiento === 'salida' ? 'reducido' : 'ajustado'} correctamente`,
      data: inventario
    });
  } catch (error) {
    console.error('Error ajustando stock:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al ajustar el stock'
    });
  }
});
