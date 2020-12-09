create view compute_orders as
  SELECT o.id, 
    o.order_date, 
    o.customer_id,
    SUM(od.quantity) as total_quantity,
    SUM(od.quantity * od.unit_price) as total_price,
    SUM(od.quantity * od.discount) as total_discount,
    SUM(od.quantity * p.standard_cost) as total_cost
    FROM order_details od
    JOIN orders AS o on o.id = od.order_id
    JOIN products AS p on p.id = od.product_id
    GROUP BY o.id;